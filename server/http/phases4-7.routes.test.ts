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
import { mockCredentialRepository } from './testHelpers/mockCredentialRepository';

describe('Phases 4-7 API', () => {
  const adminToken = 'test-admin-token-0123456789';
  const webhookSecret = 'webhook-secret-0123456789ab';
  const merchantKey = 'merchant-key-0123456789abcdef';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = webhookSecret;
    process.env.MERCHANT_API_KEY = merchantKey;
    process.env.MASTER_ENCRYPTION_KEY = Buffer.from('d'.repeat(32)).toString('base64');
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

  it('Fase 4: checkout público Pix', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/v1/public/checkout/sessions')
      .send({
        amountCents: 9900,
        description: 'Serviço teste',
        method: 'PIX',
        customer: {
          name: 'Cliente Checkout',
          email: 'checkout@example.com',
          document: '39053344705',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.session.sessionPublicId).toMatch(/^cs_/);
    expect(res.body.session.pixCopyPaste).toBeTruthy();
  });

  it('Fase 5: CRUD clientes admin', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        environment: 'SANDBOX',
        name: 'Maria Souza',
        email: 'maria@example.com',
        document: '39053344705',
      });

    expect(res.status).toBe(201);
    expect(res.body.customer.customerId).toMatch(/^np_cus_/);
  });

  it('Fase 6: saque enfileirado e ledger', async () => {
    const app = buildApp();

    const withdraw = await request(app)
      .post('/api/v1/withdrawals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amountCents: 500000, pixKey: 'merchant@nextpay.test' });

    expect(withdraw.status).toBe(202);

    const ledger = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(ledger.status).toBe(200);
    expect(Array.isArray(ledger.body.transactions)).toBe(true);
  });

  it('Fase 7: merchant profile', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/v1/merchant/profile')
      .set('x-nextpay-merchant-key', merchantKey);

    expect(res.status).toBe(200);
    expect(res.body.merchant.capabilities).toContain('payments');
  });
});
