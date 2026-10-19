import { PrismaClient, GatewayEnvironment } from '@prisma/client';

import type {
  AdminCredentialMaskedView,
  ProcessorCredentialPlaintext,
  ProcessorCredentialUpsertPatch,
  StoredCredentialRecord,
  VaultEnvironment,
} from './processorCredentialVault';
import { ProcessorCredentialVaultService } from './processorCredentialVault';

export class PrismaProcessorCredentialRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly vault: ProcessorCredentialVaultService,
  ) {}

  private mergePatch(
    current: ProcessorCredentialPlaintext | null,
    patch: ProcessorCredentialUpsertPatch,
  ): ProcessorCredentialPlaintext {
    if (!current) {
      const apiAccessToken = patch.apiAccessToken?.trim();
      if (!apiAccessToken || apiAccessToken.length < 16) {
        throw new Error(
          'Chave de API obrigatória na primeira configuração (mín. 16 caracteres).',
        );
      }
      return {
        apiAccessToken,
        webhookToken: patch.webhookToken?.trim() || undefined,
        walletId: patch.walletId?.trim() || undefined,
      };
    }

    const apiAccessToken = patch.apiAccessToken?.trim() ?? current.apiAccessToken;
    const webhookToken =
      patch.webhookToken !== undefined
        ? patch.webhookToken.trim() || undefined
        : current.webhookToken;
    const walletId =
      patch.walletId !== undefined ? patch.walletId.trim() || undefined : current.walletId;

    return { apiAccessToken, webhookToken, walletId };
  }

  async upsertCredential(
    environment: VaultEnvironment,
    patch: ProcessorCredentialUpsertPatch,
    rotationVersion?: number,
  ): Promise<{ record: StoredCredentialRecord; masked: AdminCredentialMaskedView }> {
    const envEnum = environment as GatewayEnvironment;

    const existing = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: envEnum },
    });

    const currentPlaintext = existing
      ? this.vault.decryptFromStorage({
          ciphertext: existing.ciphertext,
          rotationVersion: existing.rotationVersion,
        })
      : null;

    const merged = this.mergePatch(currentPlaintext, patch);
    const nextRotation = rotationVersion ?? (existing ? existing.rotationVersion + 1 : 1);

    const record = this.vault.encryptForStorage(environment, merged, nextRotation);
    const masked = this.vault.toAdminMaskedView(environment, merged, record.rotationVersion);

    await this.prisma.processorCredentialVault.upsert({
      where: { environment: envEnum },
      create: {
        environment: envEnum,
        ciphertext: record.ciphertext,
        prefixHint: record.prefixHint,
        suffixHint: record.suffixHint,
        rotationVersion: record.rotationVersion,
      },
      update: {
        ciphertext: record.ciphertext,
        prefixHint: record.prefixHint,
        suffixHint: record.suffixHint,
        rotationVersion: record.rotationVersion,
      },
    });

    return { record, masked };
  }

  async getAdminMaskedView(environment: VaultEnvironment): Promise<AdminCredentialMaskedView | null> {
    const row = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: environment as GatewayEnvironment },
    });
    if (!row) {
      return null;
    }

    const plaintext = this.vault.decryptFromStorage({
      ciphertext: row.ciphertext,
      rotationVersion: row.rotationVersion,
    });

    return this.vault.toAdminMaskedView(environment, plaintext, row.rotationVersion);
  }

  async getMasked(environment: VaultEnvironment): Promise<StoredCredentialRecord | null> {
    const row = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: environment as GatewayEnvironment },
    });
    if (!row) {
      return null;
    }

    return {
      environment,
      ciphertext: row.ciphertext,
      prefixHint: row.prefixHint,
      suffixHint: row.suffixHint,
      rotationVersion: row.rotationVersion,
      maskedDisplay: this.vault.toMaskedView({
        environment,
        ciphertext: row.ciphertext,
        prefixHint: row.prefixHint,
        suffixHint: row.suffixHint,
        rotationVersion: row.rotationVersion,
        maskedDisplay: '',
      }).maskedDisplay,
    };
  }

  async decryptCredential(environment: VaultEnvironment): Promise<ProcessorCredentialPlaintext | null> {
    const row = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: environment as GatewayEnvironment },
    });
    if (!row) {
      return null;
    }

    return this.vault.decryptFromStorage({
      ciphertext: row.ciphertext,
      rotationVersion: row.rotationVersion,
    });
  }

  async decryptApiToken(environment: VaultEnvironment): Promise<string> {
    const plaintext = await this.decryptCredential(environment);
    if (!plaintext) {
      throw new Error('Credencial não configurada para o ambiente solicitado.');
    }
    return plaintext.apiAccessToken;
  }

  async markValidated(environment: VaultEnvironment): Promise<void> {
    await this.prisma.processorCredentialVault.update({
      where: { environment: environment as GatewayEnvironment },
      data: { lastValidatedAt: new Date() },
    });
  }
}
