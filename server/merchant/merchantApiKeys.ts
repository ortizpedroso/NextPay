import { createHash, timingSafeEqual } from 'node:crypto';

import type { PrismaClient } from '@prisma/client';

import { newMerchantApiKeyPublicId, newMerchantApiKeySecret } from '../catalog/catalogIds';

export type MerchantApiKeySummary = {
  keyPublicId: string;
  maskedKey: string;
  createdAt: string;
  revokedAt: string | null;
};

export function hashMerchantApiKey(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function maskMerchantApiKey(secret: string): string {
  if (secret.length <= 12) {
    return `${secret.slice(0, 4)}…`;
  }
  return `${secret.slice(0, 8)}…${secret.slice(-4)}`;
}

export async function listMerchantApiKeys(
  prisma: PrismaClient,
  merchantDbId: string,
): Promise<MerchantApiKeySummary[]> {
  const rows = await prisma.merchantApiKey.findMany({
    where: { merchantId: merchantDbId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    keyPublicId: row.keyPublicId,
    maskedKey: `${row.prefixHint}…${row.suffixHint}`,
    createdAt: row.createdAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }));
}

export async function rotateMerchantApiKey(
  prisma: PrismaClient,
  merchantDbId: string,
): Promise<{ keyPublicId: string; apiKey: string; maskedKey: string }> {
  const secret = newMerchantApiKeySecret();
  const keyPublicId = newMerchantApiKeyPublicId();
  const prefixHint = secret.slice(0, 8);
  const suffixHint = secret.slice(-4);

  await prisma.$transaction([
    prisma.merchantApiKey.updateMany({
      where: { merchantId: merchantDbId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.merchantApiKey.create({
      data: {
        merchantId: merchantDbId,
        keyPublicId,
        prefixHint,
        suffixHint,
        keyHash: hashMerchantApiKey(secret),
      },
    }),
  ]);

  return {
    keyPublicId,
    apiKey: secret,
    maskedKey: maskMerchantApiKey(secret),
  };
}

export async function verifyMerchantApiKeySecret(
  prisma: PrismaClient,
  secret: string,
): Promise<{ merchantDbId: string; keyPublicId: string } | null> {
  const hash = hashMerchantApiKey(secret);
  const row = await prisma.merchantApiKey.findFirst({
    where: { keyHash: hash, revokedAt: null },
    select: { merchantId: true, keyPublicId: true, keyHash: true },
  });
  if (!row) {
    return null;
  }
  const expected = Buffer.from(row.keyHash, 'utf8');
  const actual = Buffer.from(hash, 'utf8');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  return { merchantDbId: row.merchantId, keyPublicId: row.keyPublicId };
}
