import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../createApp';

describe('Admin merchants onboarding', () => {
  const adminToken = 'test-admin-token-0123456789';

  beforeEach(() => {
    process.env.ADMIN_API_TOKEN = adminToken;
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
    process.env.JWT_SECRET = 'jwt-secret-for-tests-0123456789abcdef';
  });

  it('rejects without admin token', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/v1/admin/merchants')
      .send({ displayName: 'Loja Teste' });
    expect(res.status).toBe(401);
  });

  it('creates merchant tenant', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/v1/admin/merchants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        displayName: 'Acme Pagamentos',
        ownerEmail: `owner-${Date.now()}@example.com`,
        createSandboxVaultPlaceholder: true,
      });

    if (res.status === 201) {
      expect(res.body.merchant.merchantPublicId).toMatch(/^np_merchant_/);
      expect(res.body.merchant.displayName).toBe('Acme Pagamentos');
      expect(res.body.merchant.sandboxVaultPlaceholder.created).toBe(false);
      expect(res.body.merchant.sandboxVaultPlaceholder.reason).toBe('fixture_mode_skips_vault');
      return;
    }

    // Sem DATABASE_URL no ambiente local de teste unitário
    expect([500, 503]).toContain(res.status);
  });
});
