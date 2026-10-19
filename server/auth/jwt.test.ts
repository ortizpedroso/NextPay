import { describe, expect, it } from 'vitest';

import { signMerchantJwt, verifyMerchantJwt } from './jwt';

describe('merchant JWT', () => {
  it('assina e valida claims', () => {
    const secret = 'test-secret-0123456789abcdef';
    const token = signMerchantJwt(
      { sub: 'merchant-1', email: 'lojista@nextpay.test', role: 'merchant' },
      secret,
      3600,
    );
    const claims = verifyMerchantJwt(token, secret);
    expect(claims?.email).toBe('lojista@nextpay.test');
  });
});
