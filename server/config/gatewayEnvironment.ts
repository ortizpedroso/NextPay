import type { VaultEnvironment } from '../vault/processorCredentialVault';

export function resolveDefaultGatewayEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): VaultEnvironment {
  const raw = env.ASAAS_ENV?.trim().toLowerCase();
  if (raw === 'production' || raw === 'prod') {
    return 'PRODUCTION';
  }
  return 'SANDBOX';
}
