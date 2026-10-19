import { describe, expect, it } from 'vitest';

import { signMerchantJwt, verifyMerchantJwt } from './jwt';

describe('merchant JWT', () => {
  it('assina e valida claims', () => {
    const secret = 'test-secret-0123456789abcdef';
    const token = signMerchantJwt(
      {
        sub: 'user-1',
        merchantId: 'np_merchant_default',
        email: 'lojista@nextpay.test',
        role: 'merchant',
      },
      secret,
      3600,
    );
    const claims = verifyMerchantJwt(token, secret);
    expect(claims?.email).toBe('lojista@nextpay.test');
    expect(claims?.merchantId).toBe('np_merchant_default');
  });
});
