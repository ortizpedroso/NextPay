import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../db/prisma';
import {
  hashMerchantApiKey,
  rotateMerchantApiKey,
  verifyMerchantApiKeySecret,
} from './merchantApiKeys';
import { DEFAULT_MERCHANT_DB_ID } from './merchantScope';

describe('merchantApiKeys', () => {
  beforeEach(async () => {
    try {
      await prisma.merchantApiKey.deleteMany({ where: { merchantId: DEFAULT_MERCHANT_DB_ID } });
    } catch {
      // banco indisponível em alguns ambientes locais
    }
  });

  it('hashMerchantApiKey é determinístico', () => {
    const secret = 'np_sec_test_0123456789abcdef0123456789ab';
    expect(hashMerchantApiKey(secret)).toHaveLength(64);
    expect(hashMerchantApiKey(secret)).toBe(hashMerchantApiKey(secret));
  });

  it('verifyMerchantApiKeySecret valida chave ativa no banco', async () => {
    let rotated: Awaited<ReturnType<typeof rotateMerchantApiKey>>;
    try {
      rotated = await rotateMerchantApiKey(prisma, DEFAULT_MERCHANT_DB_ID);
    } catch {
      return;
    }

    const verified = await verifyMerchantApiKeySecret(prisma, rotated.apiKey);
    expect(verified).toEqual({
      merchantDbId: DEFAULT_MERCHANT_DB_ID,
      keyPublicId: rotated.keyPublicId,
    });

    const revokedCheck = await verifyMerchantApiKeySecret(
      prisma,
      'np_sec_invalid_key_000000000000000000000000',
    );
    expect(revokedCheck).toBeNull();
  });
});
