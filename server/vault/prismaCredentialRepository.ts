import { PrismaClient, GatewayEnvironment } from '@prisma/client';

import type { StoredCredentialRecord, VaultEnvironment } from './processorCredentialVault';
import { ProcessorCredentialVaultService } from './processorCredentialVault';

export class PrismaProcessorCredentialRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly vault: ProcessorCredentialVaultService,
  ) {}

  async upsertCredential(
    environment: VaultEnvironment,
    apiAccessToken: string,
    rotationVersion?: number,
  ): Promise<StoredCredentialRecord> {
    const envEnum = environment as GatewayEnvironment;

    const existing = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: envEnum },
    });

    const nextRotation = rotationVersion ?? (existing ? existing.rotationVersion + 1 : 1);

    const record = this.vault.encryptForStorage(environment, { apiAccessToken }, nextRotation);

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

    return record;
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

  async decryptApiToken(environment: VaultEnvironment): Promise<string> {
    const row = await this.prisma.processorCredentialVault.findUnique({
      where: { environment: environment as GatewayEnvironment },
    });
    if (!row) {
      throw new Error('Credencial não configurada para o ambiente solicitado.');
    }

    const plaintext = this.vault.decryptFromStorage({
      ciphertext: row.ciphertext,
      rotationVersion: row.rotationVersion,
    });
    return plaintext.apiAccessToken;
  }

  async markValidated(environment: VaultEnvironment): Promise<void> {
    await this.prisma.processorCredentialVault.update({
      where: { environment: environment as GatewayEnvironment },
      data: { lastValidatedAt: new Date() },
    });
  }
}
