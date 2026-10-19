import type { CredentialRepositoryPort } from '../http/routes/adminCredentials.routes';
import { resolveInboundWebhookSecrets } from '../http/webhookInboundAuth';
import type { VaultEnvironment } from './processorCredentialVault';

const VAULT_ENVIRONMENTS: VaultEnvironment[] = ['SANDBOX', 'PRODUCTION'];

export async function resolveInboundWebhookSecretsWithVault(
  credentialRepository: Pick<CredentialRepositoryPort, 'decryptCredential'>,
  env: NodeJS.ProcessEnv = process.env,
): Promise<string[]> {
  const secrets = new Set<string>(resolveInboundWebhookSecrets(env));

  for (const environment of VAULT_ENVIRONMENTS) {
    const credential = await credentialRepository.decryptCredential(environment);
    const token = credential?.webhookToken?.trim();
    if (token) {
      secrets.add(token);
    }
  }

  return [...secrets];
}
