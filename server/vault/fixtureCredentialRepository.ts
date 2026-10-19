import type { CredentialRepositoryPort } from '../http/routes/adminCredentials.routes';
import type { StoredCredentialRecord, VaultEnvironment } from './processorCredentialVault';

const DISABLED =
  'Vault de credenciais indisponível em PAYMENT_GATEWAY_MODE=fixture. Configure MASTER_ENCRYPTION_KEY e remova o modo fixture para gerenciar credenciais.';

export class FixtureCredentialRepository implements CredentialRepositoryPort {
  async upsertCredential(
    _environment: VaultEnvironment,
    _apiAccessToken: string,
    _rotationVersion?: number,
  ): Promise<StoredCredentialRecord> {
    throw new Error(DISABLED);
  }

  async getMasked(_environment: VaultEnvironment): Promise<null> {
    return null;
  }

  async decryptApiToken(_environment: VaultEnvironment): Promise<string> {
    throw new Error(DISABLED);
  }

  async markValidated(_environment: VaultEnvironment): Promise<void> {
    throw new Error(DISABLED);
  }
}
