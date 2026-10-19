import { randomBytes } from 'node:crypto';

import { prisma } from '../db/prisma';
import { ProcessorCredentialVaultService } from '../vault/processorCredentialVault';

export type OnboardMerchantInput = {
  displayName: string;
  ownerEmail?: string;
  createSandboxVaultPlaceholder?: boolean;
};

export type OnboardMerchantResult = {
  merchantPublicId: string;
  merchantDbId: string;
  displayName: string;
  ownerEmail: string | null;
  sandboxVaultPlaceholder: { created: boolean; reason?: string };
};

function newMerchantPublicId(): string {
  return `np_merchant_${randomBytes(8).toString('hex')}`;
}

function newCuidLike(prefix: string): string {
  return `${prefix}${randomBytes(10).toString('hex')}`.slice(0, 25);
}

export async function onboardMerchant(input: OnboardMerchantInput): Promise<OnboardMerchantResult> {
  const merchantPublicId = newMerchantPublicId();
  const merchantDbId = newCuidLike('cmmerchant');

  const merchant = await prisma.merchant.create({
    data: {
      id: merchantDbId,
      merchantPublicId,
      displayName: input.displayName.trim(),
    },
  });

  let ownerEmail: string | null = null;
  if (input.ownerEmail?.trim()) {
    ownerEmail = input.ownerEmail.trim().toLowerCase();
    await prisma.merchantUser.create({
      data: {
        id: newCuidLike('cmuser'),
        merchantId: merchant.id,
        email: ownerEmail,
      },
    });
  }

  let sandboxVaultPlaceholder: OnboardMerchantResult['sandboxVaultPlaceholder'] = {
    created: false,
    reason: 'not_requested',
  };

  if (input.createSandboxVaultPlaceholder) {
    const mode = process.env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
    if (mode === 'fixture' || mode === 'in_memory') {
      sandboxVaultPlaceholder = {
        created: false,
        reason: 'fixture_mode_skips_vault',
      };
    } else {
      try {
        const vault = ProcessorCredentialVaultService.fromEnvironment();
        const placeholderToken = `np_sec_sandbox_placeholder_${randomBytes(16).toString('hex')}`;
        const stored = vault.encryptForStorage('SANDBOX', { apiAccessToken: placeholderToken });
        await prisma.processorCredentialVault.upsert({
          where: { environment: 'SANDBOX' },
          create: {
            environment: 'SANDBOX',
            ciphertext: stored.ciphertext,
            prefixHint: stored.prefixHint,
            suffixHint: stored.suffixHint,
            rotationVersion: stored.rotationVersion,
          },
          update: {
            ciphertext: stored.ciphertext,
            prefixHint: stored.prefixHint,
            suffixHint: stored.suffixHint,
            rotationVersion: { increment: 1 },
          },
        });
        sandboxVaultPlaceholder = { created: true };
      } catch (error) {
        sandboxVaultPlaceholder = {
          created: false,
          reason: error instanceof Error ? error.message : 'vault_unavailable',
        };
      }
    }
  }

  return {
    merchantPublicId: merchant.merchantPublicId,
    merchantDbId: merchant.id,
    displayName: merchant.displayName,
    ownerEmail,
    sandboxVaultPlaceholder,
  };
}
