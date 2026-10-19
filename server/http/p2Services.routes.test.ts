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

describe('P2 service stubs', () => {
  const adminToken = 'test-admin-token-0123456789';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
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
      outboundWebhookService: new NoopOutboundWebhookService(),
      catalogProductStore: new InMemoryCatalogProductStore(),
      paymentLinkStore: new InMemoryPaymentLinkStore(),
    });
  }

  it('POST /services/antecipacao/quote returns stub quote', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/v1/services/antecipacao/quote')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ receivableCents: 100_000 });
    expect(res.status).toBe(200);
    expect(res.body.quote.stub).toBe(true);
    expect(res.body.quote.netCents).toBeLessThan(100_000);
  });
});
