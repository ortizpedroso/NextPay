import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveProcessorSplit } from './splitConfig';

describe('resolveProcessorSplit', () => {
  beforeEach(() => {
    process.env.NEXTPAY_WALLET_ID = 'wallet-root';
    process.env.NEXTPAY_SPLIT_PERCENT = '2';
  });

  afterEach(() => {
    delete process.env.NEXTPAY_WALLET_ID;
    delete process.env.NEXTPAY_SPLIT_PERCENT;
  });

  it('retorna split quando carteira configurada', () => {
    const split = resolveProcessorSplit({ amountCents: 10_000 });
    expect(split).toEqual([{ walletId: 'wallet-root', percentualValue: 2, fixedValue: null }]);
  });

  it('retorna undefined sem carteira', () => {
    delete process.env.NEXTPAY_WALLET_ID;
    expect(resolveProcessorSplit({ amountCents: 100 })).toBeUndefined();
  });
});
