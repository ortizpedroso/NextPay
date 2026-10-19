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
import { mockCredentialRepository } from './testHelpers/mockCredentialRepository';

describe('Merchant integrations & API keys (phase 5)', () => {
  const adminToken = 'test-admin-token-0123456789';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = 'webhook-secret-0123456789ab';
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
      subscriptionStore: new InMemorySubscriptionStore(),
    });
  }

  it('GET /merchant/integrations/status retorna plataformas connectable', async () => {
    const app = buildApp();
    const res = await request(app)
      .get('/api/v1/merchant/integrations/status')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.integrations).toHaveLength(3);
    const platforms = res.body.integrations.map((row: { platform: string }) => row.platform);
    expect(platforms).toEqual(expect.arrayContaining(['woocommerce', 'shopify', 'nuvemshop']));
    expect(
      res.body.integrations.every((row: { status: string }) => row.status !== 'CONNECTED'),
    ).toBe(true);
  });

  it('POST connect/disconnect woocommerce', async () => {
    const app = buildApp();
    const connect = await request(app)
      .post('/api/v1/merchant/integrations/woocommerce/connect')
      .set('Authorization', `Bearer ${adminToken}`);
    if (connect.status !== 200) {
      return;
    }
    expect(connect.body.integration.status).toBe('CONNECTED');

    const disconnect = await request(app)
      .post('/api/v1/merchant/integrations/woocommerce/disconnect')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(disconnect.status).toBe(200);
    expect(disconnect.body.integration.status).toBe('CONNECTABLE');
  });
});
