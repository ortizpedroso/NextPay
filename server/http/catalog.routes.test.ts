import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryPaymentGateway } from '../gateway/adapters/in-memory-gateway.adapter';
import {
  createApp,
  InMemoryCatalogProductStore,
  InMemoryCheckoutSessionStore,
  InMemoryLedgerStore,
  InMemoryMerchantCustomerStore,
  InMemoryPaymentLinkStore,
  NoopOutboundWebhookService,
} from '../createApp';
import { InMemoryWebhookEventStore } from '../payments/webhookEventStore';
import type { CredentialRepositoryPort } from './routes/adminCredentials.routes';

function mockCredentialRepository(): CredentialRepositoryPort {
  return {
    upsertCredential: vi.fn(),
    getMasked: vi.fn(),
    decryptApiToken: vi.fn(async () => 'np_sec_sandbox_0123456789abcdef0123456789ab'),
    markValidated: vi.fn(),
  };
}

describe('Catalog & payment links API', () => {
  const adminToken = 'test-admin-token-0123456789';
  const merchantKey = 'merchant-key-0123456789abcdef';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = 'webhook-secret-0123456789ab';
    process.env.MERCHANT_API_KEY = merchantKey;
    process.env.MASTER_ENCRYPTION_KEY = Buffer.from('d'.repeat(32)).toString('base64');
    process.env.PAYMENT_LINK_BASE_URL = 'https://nextpay.link/silva-design';
  });

  function buildApp() {
    return createApp({
      credentialRepository: mockCredentialRepository(),
      resolvePaymentGateway: async () => new InMemoryPaymentGateway('SANDBOX'),
      webhookEventStore: new InMemoryWebhookEventStore(),
      checkoutSessionStore: new InMemoryCheckoutSessionStore(),
      ledgerStore: new InMemoryLedgerStore(),
      merchantCustomerStore: new InMemoryMerchantCustomerStore(),
      outboundWebhookService: new NoopOutboundWebhookService(),
      catalogProductStore: new InMemoryCatalogProductStore(),
      paymentLinkStore: new InMemoryPaymentLinkStore(),
    });
  }

  it('admin: CRUD produto com centavos', async () => {
    const app = buildApp();

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Consultoria Financeira',
        description: 'Sessão 1:1',
        category: 'servicos',
        priceCents: 45000,
        billingType: 'avulsa',
        maxInstallments: 6,
      });

    expect(created.status).toBe(201);
    expect(created.body.product.productPublicId).toMatch(/^np_prod_/);
    expect(created.body.product.priceCents).toBe(45000);
    expect(created.body.product.checkoutUrl).toContain('https://nextpay.link/silva-design/');

    const list = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(list.status).toBe(200);
    expect(list.body.products).toHaveLength(1);
  });

  it('admin: PATCH produto atualiza centavos', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Workshop',
        priceCents: 10000,
        category: 'servicos',
      });

    const productPublicId = created.body.product.productPublicId as string;

    const patched = await request(app)
      .patch(`/api/v1/products/${productPublicId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ priceCents: 12500, title: 'Workshop Premium' });

    expect(patched.status).toBe(200);
    expect(patched.body.product.priceCents).toBe(12500);
    expect(patched.body.product.title).toBe('Workshop Premium');
  });

  it('admin: cria link de pagamento', async () => {
    const app = buildApp();

    const created = await request(app)
      .post('/api/v1/payment-links')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Mentoria UX',
        billingType: 'recorrente',
        amountCents: 150000,
      });

    expect(created.status).toBe(201);
    expect(created.body.paymentLink.linkPublicId).toMatch(/^np_link_/);
    expect(created.body.paymentLink.amountCents).toBe(150000);
    expect(created.body.paymentLink.status).toBe('ACTIVE');
  });

  it('merchant: lista produtos e links', async () => {
    const app = buildApp();

    await request(app).post('/api/v1/products').set('Authorization', `Bearer ${adminToken}`).send({
      title: 'E-book Gestão',
      priceCents: 9700,
      category: 'digitais',
    });

    await request(app)
      .post('/api/v1/payment-links')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Landing Page',
        amountCents: 380000,
        billingType: 'avulsa',
      });

    const products = await request(app)
      .get('/api/v1/merchant/products')
      .set('x-nextpay-merchant-key', merchantKey);

    expect(products.status).toBe(200);
    expect(products.body.products.length).toBeGreaterThanOrEqual(1);

    const links = await request(app)
      .get('/api/v1/merchant/payment-links')
      .set('x-nextpay-merchant-key', merchantKey);

    expect(links.status).toBe(200);
    expect(links.body.paymentLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('rejeita admin sem token', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(401);
  });
});
