import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryPaymentGateway } from '../gateway/adapters/in-memory-gateway.adapter';
import {
  createApp,
  InMemoryCheckoutSessionStore,
  InMemoryLedgerStore,
  NoopOutboundWebhookService,
} from '../createApp';
import { InMemoryIdempotencyStore } from '../payments/inMemoryIdempotencyStore';
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

describe('Phase 3 payments & webhooks API', () => {
  const adminToken = 'test-admin-token-0123456789';
  const webhookSecret = 'webhook-secret-0123456789ab';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.WEBHOOK_INBOUND_SECRET = webhookSecret;
    process.env.MASTER_ENCRYPTION_KEY = Buffer.from('c'.repeat(32)).toString('base64');
  });

  function buildApp(overrides: Parameters<typeof createApp>[0] = {}) {
    return createApp({
      credentialRepository: mockCredentialRepository(),
      resolvePaymentGateway: async () => new InMemoryPaymentGateway('SANDBOX'),
      webhookEventStore: new InMemoryWebhookEventStore(),
      idempotencyStore: new InMemoryIdempotencyStore(),
      checkoutSessionStore: new InMemoryCheckoutSessionStore(),
      ledgerStore: new InMemoryLedgerStore(),
      outboundWebhookService: new NoopOutboundWebhookService(),
      ...overrides,
    });
  }

  it('POST /api/v1/payments cria cobrança PIX neutra', async () => {
    const gateway = new InMemoryPaymentGateway('SANDBOX');
    const customer = await gateway.createCustomer({
      name: 'Cliente Pix',
      email: 'pix@example.com',
      document: '39053344705',
    });

    const app = buildApp({
      resolvePaymentGateway: async () => gateway,
    });

    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        environment: 'SANDBOX',
        amountCents: 25000,
        method: 'PIX',
        description: 'Serviço Pix',
        customerId: customer.customerId,
        idempotencyKey: 'idem-pix-12345678',
      });

    expect(res.status).toBe(201);
    expect(res.body.payment.paymentId).toMatch(/^np_pay_/);
    expect(res.body.payment.pix?.copyPasteCode).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/asaas/i);
  });

  it('POST /api/v1/webhooks/inbound é idempotente', async () => {
    const app = buildApp();

    const payload = {
      event: 'PAYMENT_RECEIVED',
      payment: { id: 'ext-pay-001', value: 120.5, status: 'RECEIVED' },
    };

    const first = await request(app)
      .post('/api/v1/webhooks/inbound')
      .set('x-nextpay-webhook-token', webhookSecret)
      .send(payload);

    const second = await request(app)
      .post('/api/v1/webhooks/inbound')
      .set('x-nextpay-webhook-token', webhookSecret)
      .send(payload);

    expect(first.status).toBe(200);
    expect(first.body.status).toBe('processed');
    expect(second.status).toBe(200);
    expect(second.body.status).toBe('duplicate_ignored');
  });

  it('POST /api/v1/webhooks/inbound aceita cabeçalho asaas-access-token', async () => {
    const app = buildApp();

    const payload = {
      event: 'PAYMENT_CONFIRMED',
      payment: { id: 'ext-pay-asaas-01', value: 99.9, status: 'CONFIRMED' },
    };

    const res = await request(app)
      .post('/api/v1/webhooks/inbound')
      .set('asaas-access-token', webhookSecret)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processed');
  });

  it('rejeita webhook sem token', async () => {
    const app = buildApp();

    const res = await request(app)
      .post('/api/v1/webhooks/inbound')
      .send({ event: 'PAYMENT_RECEIVED' });

    expect(res.status).toBe(401);
  });
});
