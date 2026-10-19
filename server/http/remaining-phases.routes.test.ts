import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signMerchantJwt } from '../auth/jwt';
import { InMemoryPaymentGateway } from '../gateway/adapters/in-memory-gateway.adapter';
import {
  createApp,
  InMemoryCatalogProductStore,
  InMemoryCheckoutSessionStore,
  InMemoryLedgerStore,
  InMemoryMerchantCustomerStore,
  InMemoryOutboundWebhookService,
  InMemoryPaymentLinkStore,
} from '../createApp';
import { InMemoryWebhookEventStore } from '../payments/webhookEventStore';
import type { CredentialRepositoryPort } from './routes/adminCredentials.routes';

function mockCredentialRepository(): CredentialRepositoryPort {
  return {
    upsertCredential: vi.fn(),
    getMasked: vi.fn(),
    decryptApiToken: vi.fn(async () => 'np_sec_test_0123456789abcdef0123456789ab'),
    markValidated: vi.fn(),
  };
}

describe('Remaining phases — public links, JWT, webhooks stats', () => {
  const adminToken = 'test-admin-token-0123456789';
  const webhookSecret = 'webhook-secret-0123456789ab';
  const jwtSecret = 'jwt-secret-for-tests-0123456789abcdef';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = webhookSecret;
    process.env.JWT_SECRET = jwtSecret;
    process.env.MERCHANT_LOGIN_EMAIL = 'lojista@nextpay.test';
    process.env.MERCHANT_LOGIN_PASSWORD = 'senha-segura-123';
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
  });

  function buildApp() {
    return createApp({
      credentialRepository: mockCredentialRepository(),
      resolvePaymentGateway: async () => new InMemoryPaymentGateway('SANDBOX'),
      webhookEventStore: new InMemoryWebhookEventStore(),
      checkoutSessionStore: new InMemoryCheckoutSessionStore(),
      ledgerStore: new InMemoryLedgerStore(),
      merchantCustomerStore: new InMemoryMerchantCustomerStore(),
      outboundWebhookService: new InMemoryOutboundWebhookService(),
      catalogProductStore: new InMemoryCatalogProductStore(),
      paymentLinkStore: new InMemoryPaymentLinkStore(),
    });
  }

  it('resolve link público por slug incrementa views', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/api/v1/payment-links')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Consultoria Express',
        amountCents: 15000,
        billingType: 'avulsa',
      });

    const slug = created.body.paymentLink.urlSlug as string;

    const resolved = await request(app).get(`/api/v1/public/resolve/${slug}`);
    expect(resolved.status).toBe(200);
    expect(resolved.body.checkout.kind).toBe('payment_link');
    expect(resolved.body.checkout.amountCents).toBe(15000);

    const listed = await request(app)
      .get('/api/v1/payment-links')
      .set('Authorization', `Bearer ${adminToken}`);
    const link = listed.body.paymentLinks.find((row: { urlSlug: string }) => row.urlSlug === slug);
    expect(link.viewCount).toBeGreaterThanOrEqual(1);
  });

  it('merchant login emite JWT aceito nas rotas do painel', async () => {
    const app = buildApp();
    const login = await request(app)
      .post('/api/v1/merchant/auth/login')
      .send({ email: 'lojista@nextpay.test', password: 'senha-segura-123' });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const products = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(products.status).toBe(200);
  });

  it('webhook confirmado incrementa vendas do link associado', async () => {
    const app = buildApp();

    const linkRes = await request(app)
      .post('/api/v1/payment-links')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Link Stats', amountCents: 9900, billingType: 'avulsa' });
    const linkPublicId = linkRes.body.paymentLink.linkPublicId as string;

    const sessionRes = await request(app)
      .post('/api/v1/public/checkout/sessions')
      .send({
        amountCents: 9900,
        description: 'Link Stats',
        method: 'PIX',
        paymentLinkPublicId: linkPublicId,
        customer: {
          name: 'Cliente',
          email: 'c@example.com',
          document: '39053344705',
        },
      });

    const paymentId = sessionRes.body.session.paymentId as string;

    await request(app)
      .post('/api/v1/webhooks/inbound')
      .set('x-nextpay-webhook-token', webhookSecret)
      .send({
        event: 'PAYMENT_RECEIVED',
        payment: { id: paymentId, value: 99, status: 'RECEIVED' },
      });

    const listed = await request(app)
      .get('/api/v1/payment-links')
      .set(
        'Authorization',
        `Bearer ${signMerchantJwt(
          {
            sub: 'm',
            merchantId: 'np_merchant_default',
            email: 'lojista@nextpay.test',
            role: 'merchant',
          },
          jwtSecret,
        )}`,
      );

    const link = listed.body.paymentLinks.find(
      (row: { linkPublicId: string }) => row.linkPublicId === linkPublicId,
    );
    expect(link.salesCount).toBe(1);
    expect(link.totalBilledCents).toBe(9900);
  });

  it('outbound webhook enfileira entrega quando MERCHANT_WEBHOOK_URL definido', async () => {
    process.env.MERCHANT_WEBHOOK_URL = 'https://merchant.example/webhooks';
    const outbound = new InMemoryOutboundWebhookService();
    const app = createApp({
      credentialRepository: mockCredentialRepository(),
      resolvePaymentGateway: async () => new InMemoryPaymentGateway('SANDBOX'),
      webhookEventStore: new InMemoryWebhookEventStore(),
      checkoutSessionStore: new InMemoryCheckoutSessionStore(),
      ledgerStore: new InMemoryLedgerStore(),
      merchantCustomerStore: new InMemoryMerchantCustomerStore(),
      outboundWebhookService: outbound,
      catalogProductStore: new InMemoryCatalogProductStore(),
      paymentLinkStore: new InMemoryPaymentLinkStore(),
    });

    await request(app)
      .post('/api/v1/webhooks/inbound')
      .set('x-nextpay-webhook-token', webhookSecret)
      .send({
        event: 'PAYMENT_RECEIVED',
        payment: { id: 'np_pay_deadbeef00000000000001', value: 10, status: 'RECEIVED' },
      });

    expect(outbound.deliveries.length).toBe(1);
    expect(outbound.deliveries[0]?.targetUrl).toBe('https://merchant.example/webhooks');
  });
});
