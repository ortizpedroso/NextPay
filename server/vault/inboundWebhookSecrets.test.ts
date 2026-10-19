import { describe, expect, it, vi } from 'vitest';

import { resolveInboundWebhookSecretsWithVault } from './inboundWebhookSecrets';

describe('resolveInboundWebhookSecretsWithVault', () => {
  it('combina segredos do .env e do vault por ambiente', async () => {
    const secrets = await resolveInboundWebhookSecretsWithVault(
      {
        decryptCredential: vi.fn(async (environment) => {
          if (environment === 'SANDBOX') {
            return {
              apiAccessToken: 'np_sec_sandbox_0123456789abcdef0123456789ab',
              webhookToken: 'vault-sandbox-webhook-0123456789',
            };
          }
          return {
            apiAccessToken: 'np_sec_production_0123456789abcdef0123456789ab',
            webhookToken: 'vault-production-webhook-0123456789',
          };
        }),
      },
      {
        WEBHOOK_INBOUND_SECRET: 'env-global-webhook-0123456789',
      } as NodeJS.ProcessEnv,
    );

    expect(secrets).toContain('env-global-webhook-0123456789');
    expect(secrets).toContain('vault-sandbox-webhook-0123456789');
    expect(secrets).toContain('vault-production-webhook-0123456789');
  });
});
