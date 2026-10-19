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
  InMemorySubscriptionStore,
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

describe('Subscriptions API (phase 4)', () => {
  const adminToken = 'test-admin-token-0123456789';
  const jwtSecret = 'jwt-secret-for-tests-0123456789abcdef';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = 'webhook-secret-0123456789ab';
    process.env.JWT_SECRET = jwtSecret;
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
  });

  function buildApp(subscriptionStore = new InMemorySubscriptionStore()) {
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
      subscriptionStore,
    });
  }

  it('CRUD assinatura com centavos e escopo merchant via admin token', async () => {
    const app = buildApp();

    const created = await request(app)
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        planTitle: 'Consultoria UX/UI Contínua',
        priceCents: 150000,
        cadenceLabel: 'Mensal',
        customerName: 'Mariana Albuquerque',
        customerEmail: 'mariana@example.com',
        paymentMethod: 'Cartão de Crédito',
        nextBillingAt: new Date(Date.now() - 60_000).toISOString(),
      });

    expect(created.status).toBe(201);
    expect(created.body.subscription.subscriptionPublicId).toMatch(/^np_sub_/);
    expect(created.body.subscription.priceCents).toBe(150000);

    const subscriptionPublicId = created.body.subscription.subscriptionPublicId as string;

    const listed = await request(app)
      .get('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listed.body.subscriptions).toHaveLength(1);

    const patched = await request(app)
      .patch(`/api/v1/subscriptions/${subscriptionPublicId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'OVERDUE' });
    expect(patched.body.subscription.status).toBe('OVERDUE');

    const metrics = await request(app)
      .get('/api/v1/subscriptions/metrics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(metrics.body.metrics.mrrCents).toBeGreaterThanOrEqual(150000);
  });

  it('job de renovação cria pagamento para ciclo vencido', async () => {
    const store = new InMemorySubscriptionStore();
    const app = buildApp(store);

    await request(app)
      .post('/api/v1/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        planTitle: 'Suporte Cloud',
        priceCents: 85000,
        cadenceLabel: 'Mensal',
        customerName: 'Lucas Oliveira',
        customerEmail: 'lucas@example.com',
        paymentMethod: 'Boleto Recorrente',
        nextBillingAt: new Date(Date.now() - 86_400_000).toISOString(),
      });

    const renewal = await request(app)
      .post('/api/v1/jobs/process-subscription-renewals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(renewal.status).toBe(200);
    expect(renewal.body.processed).toBe(1);
    expect(renewal.body.payments[0].neutralPaymentId).toMatch(/^np_pay_/);
  });
});
