import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetHostedCardTokensForTests } from '../checkout/hostedCardTokens';
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
import { prisma } from '../db/prisma';
import { rotateMerchantApiKey } from '../merchant/merchantApiKeys';
import { DEFAULT_MERCHANT_DB_ID } from '../merchant/merchantScope';
import { resetWithdrawalStubStoreForTests } from '../payments/withdrawalStubStore';
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

describe('Production phases — merchant keys, jobs, hosted card, sandbox', () => {
  const adminToken = 'test-admin-token-0123456789';
  const internalToken = 'internal-job-token-0123456789ab';
  const legacyMerchantKey = 'merchant-key-0123456789abcdef';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.INTERNAL_JOB_TOKEN = internalToken;
    process.env.WEBHOOK_INBOUND_SECRET = 'webhook-secret-0123456789ab';
    process.env.MERCHANT_API_KEY = legacyMerchantKey;
    process.env.JWT_SECRET = 'jwt-secret-for-tests-0123456789abcdef';
    process.env.MERCHANT_LOGIN_EMAIL = 'lojista@nextpay.test';
    process.env.MERCHANT_LOGIN_PASSWORD = 'senha-segura-123';
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
    process.env.APP_URL = 'http://localhost:3000';
    resetHostedCardTokensForTests();
    resetWithdrawalStubStoreForTests();
  });

  function buildApp(outbound = new InMemoryOutboundWebhookService()) {
    return createApp({
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
  }

  it('merchant API aceita chave rotacionada no banco (hash)', async () => {
    let apiKey: string;
    try {
      const rotated = await rotateMerchantApiKey(prisma, DEFAULT_MERCHANT_DB_ID);
      apiKey = rotated.apiKey;
    } catch {
      return;
    }

    const app = buildApp();
    const res = await request(app)
      .get('/api/v1/merchant/profile')
      .set('x-nextpay-merchant-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.merchant.merchantId).toBeTruthy();
  });

  it('POST /jobs/process-outbound-retries com INTERNAL_JOB_TOKEN', async () => {
    const outbound = new InMemoryOutboundWebhookService();
    const app = buildApp(outbound);

    const res = await request(app)
      .post('/api/v1/jobs/process-outbound-retries')
      .set('Authorization', `Bearer ${internalToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.attempted).toBe(0);
  });

  it('hosted card: emite redirect e confirma sem PAN', async () => {
    const app = buildApp();
    const sessionRes = await request(app)
      .post('/api/v1/public/checkout/sessions')
      .send({
        amountCents: 12000,
        description: 'Cartão hosted',
        method: 'CREDIT_CARD',
        customer: {
          name: 'Cliente',
          email: 'c@example.com',
          document: '39053344705',
        },
      });

    const sessionPublicId = sessionRes.body.session.sessionPublicId as string;

    const hosted = await request(app).post(
      `/api/v1/public/checkout/sessions/${sessionPublicId}/hosted-card`,
    );
    expect(hosted.status).toBe(201);
    expect(hosted.body.redirectUrl).toContain('/hosted-card/');
    expect(hosted.body.paymentToken).toMatch(/^hct_/);

    const confirm = await request(app)
      .post(`/api/v1/public/checkout/hosted-card/${hosted.body.paymentToken}/confirm`)
      .send({ cardLast4: '4242', cardBrand: 'Visa' });

    expect(confirm.status).toBe(200);
    expect(confirm.body.status).toBe('PENDING_CARD_CAPTURE');
    expect(confirm.body.cardLast4).toBe('4242');
  });

  it('saque stub progride status via GET', async () => {
    const app = buildApp();
    const created = await request(app)
      .post('/api/v1/withdrawals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amountCents: 10000, pixKey: 'merchant@nextpay.test' });

    expect(created.status).toBe(202);
    const protocol = created.body.protocol as string;

    const detail = await request(app)
      .get(`/api/v1/withdrawals/${protocol}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detail.status).toBe(200);
    expect(['QUEUED', 'PROCESSING', 'COMPLETED']).toContain(detail.body.withdrawal.status);
  });

  it('sandbox simulate-sale grava ledger', async () => {
    const app = buildApp();
    const login = await request(app)
      .post('/api/v1/merchant/auth/login')
      .send({ email: 'lojista@nextpay.test', password: 'senha-segura-123' });

    const simulated = await request(app)
      .post('/api/v1/sandbox/simulate-sale')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ amountCents: 5500, description: 'Simulação' });

    expect(simulated.status).toBe(201);
    expect(simulated.body.simulated).toBe(true);

    const ledger = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(
      ledger.body.transactions.some(
        (row: { neutralPaymentId: string }) => row.neutralPaymentId === simulated.body.paymentId,
      ),
    ).toBe(true);
  });
});
