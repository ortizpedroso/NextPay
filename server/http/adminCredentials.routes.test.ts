import request from 'supertest';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { InMemoryPaymentGateway } from '../gateway/adapters/in-memory-gateway.adapter';
import { createApp } from '../createApp';
import type { CredentialRepositoryPort } from './routes/adminCredentials.routes';

vi.mock('../gateway/paymentGatewayFactory', () => ({
  createPaymentGatewayForEnvironment: vi.fn(async () => new InMemoryPaymentGateway('SANDBOX')),
}));

function createMockRepository(): CredentialRepositoryPort {
  const maskedView = {
    environment: 'SANDBOX' as const,
    maskedApiToken: 'np_sec_••••••••••••9abc',
    maskedWebhookToken: 'webhook_••••••••••••9abc',
    maskedWalletId: 'wallet-_••••••••••••9abc',
    configuredApi: true,
    configuredWebhook: true,
    configuredWallet: true,
    rotationVersion: 1,
  };

  return {
    upsertCredential: vi.fn(async (environment) => ({
      record: {
        environment,
        ciphertext: 'cipher',
        prefixHint: 'np_sec',
        suffixHint: '9abc',
        rotationVersion: 1,
        maskedDisplay: 'np_sec_••••••••••••9abc',
      },
      masked: { ...maskedView, environment },
    })),
    getAdminMaskedView: vi.fn(async (environment) => ({
      ...maskedView,
      environment,
    })),
    decryptCredential: vi.fn(async () => null),
    decryptApiToken: vi.fn(async () => 'np_sec_sandbox_0123456789abcdef0123456789ab'),
    markValidated: vi.fn(async () => undefined),
  };
}

describe('Admin credentials API', () => {
  const adminToken = 'test-admin-token-0123456789';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.MASTER_ENCRYPTION_KEY = Buffer.from('b'.repeat(32)).toString('base64');
  });

  it('GET /api/v1/health retorna ok', async () => {
    const app = createApp({ credentialRepository: createMockRepository() });
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('nextpay-api');
  });

  it('rejeita admin sem bearer token', async () => {
    const app = createApp({ credentialRepository: createMockRepository() });
    const res = await request(app).get('/api/v1/admin/credentials/SANDBOX');
    expect(res.status).toBe(401);
  });

  it('GET credentials retorna token mascarado', async () => {
    const repo = createMockRepository();
    const app = createApp({ credentialRepository: repo });

    const res = await request(app)
      .get('/api/v1/admin/credentials/sandbox')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.maskedToken).toContain('np_sec');
    expect(res.body.maskedWebhookToken).toContain('webhook');
    expect(JSON.stringify(res.body)).not.toMatch(/asaas/i);
  });

  it('PUT credentials armazena via repositório', async () => {
    const repo = createMockRepository();
    const app = createApp({ credentialRepository: repo });

    const res = await request(app)
      .put('/api/v1/admin/credentials/PRODUCTION')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        apiAccessToken: 'np_sec_production_0123456789abcdef0123456789ab',
        webhookToken: 'webhook-secret-0123456789ab',
        walletId: 'wallet-root-0123456789',
      });

    expect(res.status).toBe(200);
    expect(repo.upsertCredential).toHaveBeenCalledOnce();
    expect(res.body.configuredWebhook).toBe(true);
  });

  it('POST test conectividade usa gateway e marca validação', async () => {
    const repo = createMockRepository();
    const app = createApp({ credentialRepository: repo });

    const res = await request(app)
      .post('/api/v1/admin/credentials/SANDBOX/test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(repo.markValidated).toHaveBeenCalledOnce();
  });
});
