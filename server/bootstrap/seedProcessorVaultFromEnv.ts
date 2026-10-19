import { prisma } from '../db/prisma';
import { resolveDefaultGatewayEnvironment } from '../config/gatewayEnvironment';
import { ProcessorCredentialVaultService } from '../vault/processorCredentialVault';
import { PrismaProcessorCredentialRepository } from '../vault/prismaCredentialRepository';
import { hasMasterEncryptionKey } from '../crypto/masterKey';

export type VaultSeedSkipReason =
  | 'fixture_mode'
  | 'missing_api_key'
  | 'missing_master_key'
  | 'already_configured';

export type VaultSeedResult =
  | { status: 'skipped'; reason: VaultSeedSkipReason }
  | { status: 'seeded'; environment: 'SANDBOX' | 'PRODUCTION' };

function isFixtureMode(env: NodeJS.ProcessEnv): boolean {
  const mode = env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
  return mode === 'fixture' || mode === 'in_memory';
}

export async function seedProcessorVaultFromEnvIfNeeded(
  env: NodeJS.ProcessEnv = process.env,
): Promise<VaultSeedResult> {
  if (isFixtureMode(env)) {
    return { status: 'skipped', reason: 'fixture_mode' };
  }

  const apiKey = env.ASAAS_API_KEY?.trim();
  if (!apiKey) {
    return { status: 'skipped', reason: 'missing_api_key' };
  }

  if (!hasMasterEncryptionKey(env)) {
    return { status: 'skipped', reason: 'missing_master_key' };
  }

  const environment = resolveDefaultGatewayEnvironment(env);
  const vault = ProcessorCredentialVaultService.fromEnvironment(env);
  const repository = new PrismaProcessorCredentialRepository(prisma, vault);

  const existing = await repository.getAdminMaskedView(environment);
  if (existing) {
    return { status: 'skipped', reason: 'already_configured' };
  }

  const webhookToken =
    env.WEBHOOK_INBOUND_SECRET?.trim() || env.ASAAS_WEBHOOK_TOKEN?.trim() || undefined;
  const walletId = env.NEXTPAY_WALLET_ID?.trim() || undefined;

  await repository.upsertCredential(environment, {
    apiAccessToken: apiKey,
    webhookToken,
    walletId,
  });
  return { status: 'seeded', environment };
}
