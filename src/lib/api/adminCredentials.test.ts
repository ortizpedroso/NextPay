import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMaskedCredential,
  testProcessorConnectivity,
  uiEnvironmentToApi,
  upsertProcessorCredential,
} from './adminCredentials';
import { setAdminBearerToken, clearAdminBearerToken } from './adminSession';

describe('adminCredentials API client', () => {
  beforeEach(() => {
    setAdminBearerToken('dev-admin-token-0123456789');
  });

  afterEach(() => {
    clearAdminBearerToken();
    vi.restoreAllMocks();
  });

  it('mapeia ambiente da UI para API', () => {
    expect(uiEnvironmentToApi('prod')).toBe('PRODUCTION');
    expect(uiEnvironmentToApi('sandbox')).toBe('SANDBOX');
  });

  it('fetchMaskedCredential envia Authorization Bearer', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          environment: 'SANDBOX',
          maskedToken: 'np_sec_••••••••••••9abc',
          maskedApiToken: 'np_sec_••••••••••••9abc',
          maskedWebhookToken: null,
          maskedWalletId: null,
          rotationVersion: 1,
          configured: true,
          configuredApi: true,
          configuredWebhook: false,
          configuredWallet: false,
        }),
        { status: 200 },
      ),
    );

    const result = await fetchMaskedCredential('SANDBOX');
    expect(result?.maskedToken).toContain('np_sec');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/admin/credentials/SANDBOX',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer dev-admin-token-0123456789',
        }),
      }),
    );
  });

  it('upsertProcessorCredential faz PUT com token do processador', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          environment: 'PRODUCTION',
          maskedToken: 'np_sec_••••••••••••abcd',
          rotationVersion: 2,
          configured: true,
        }),
        { status: 200 },
      ),
    );

    const result = await upsertProcessorCredential('PRODUCTION', {
      apiAccessToken: 'np_sec_production_0123456789abcdef0123456789ab',
      webhookToken: 'webhook-secret-0123456789ab',
    });
    expect(result.rotationVersion).toBe(2);
  });

  it('testProcessorConnectivity retorna latência', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          environment: 'SANDBOX',
          ok: true,
          latencyMs: 120,
          message: 'OK',
        }),
        { status: 200 },
      ),
    );

    const result = await testProcessorConnectivity('SANDBOX');
    expect(result.ok).toBe(true);
    expect(result.latencyMs).toBe(120);
  });
});
