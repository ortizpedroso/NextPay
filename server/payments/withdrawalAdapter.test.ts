import { describe, expect, it } from 'vitest';

import { FixtureWithdrawalAdapter, resolveWithdrawalAdapter } from './withdrawalAdapter';

describe('withdrawalAdapter', () => {
  it('fixture mode uses simulated adapter', async () => {
    const adapter = resolveWithdrawalAdapter({ PAYMENT_GATEWAY_MODE: 'fixture' });
    expect(adapter).toBeInstanceOf(FixtureWithdrawalAdapter);
    const result = await adapter.submit({
      amountCents: 100,
      pixKey: 'test@example.com',
      protocol: 'wd_test',
    });
    expect(result.status).toBe('QUEUED');
  });
});
