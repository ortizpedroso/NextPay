import type { CredentialRepositoryPort } from '../http/routes/adminCredentials.routes';
import type {
  AdminCredentialMaskedView,
  ProcessorCredentialPlaintext,
  ProcessorCredentialUpsertPatch,
  VaultEnvironment,
} from './processorCredentialVault';

const DISABLED =
  'Vault de credenciais indisponível em PAYMENT_GATEWAY_MODE=fixture. Configure MASTER_ENCRYPTION_KEY e remova o modo fixture para gerenciar credenciais.';

export class FixtureCredentialRepository implements CredentialRepositoryPort {
  async upsertCredential(
    _environment: VaultEnvironment,
    _patch: ProcessorCredentialUpsertPatch,
  ): Promise<{ record: never; masked: AdminCredentialMaskedView }> {
    throw new Error(DISABLED);
  }

  async getAdminMaskedView(_environment: VaultEnvironment): Promise<null> {
    return null;
  }

  async decryptCredential(_environment: VaultEnvironment): Promise<ProcessorCredentialPlaintext | null> {
    return null;
  }

  async decryptApiToken(_environment: VaultEnvironment): Promise<string> {
    throw new Error(DISABLED);
  }

  async markValidated(_environment: VaultEnvironment): Promise<void> {
    throw new Error(DISABLED);
  }
}
