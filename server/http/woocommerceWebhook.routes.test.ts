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

describe('WooCommerce inbound webhook stub', () => {
  const webhookSecret = 'webhook-secret-0123456789ab';

  beforeEach(() => {
    process.env.WEBHOOK_INBOUND_SECRET = webhookSecret;
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
  });

  it('accepts stub payload with token', async () => {
    const app = createApp({
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

    const res = await request(app)
      .post('/api/v1/webhooks/inbound/woocommerce')
      .set('x-nextpay-webhook-token', webhookSecret)
      .send({ orderId: 'woo-123', eventType: 'paid', amountCents: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.stub).toBe(true);
    expect(res.body.status).toBe('accepted');
  });
});
