import { describe, expect, it } from 'vitest';

import { createApp } from './createApp';

describe('createApp fixture boot', () => {
  it('inicia sem MASTER_ENCRYPTION_KEY quando PAYMENT_GATEWAY_MODE=fixture', () => {
    delete process.env.MASTER_ENCRYPTION_KEY;
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
    const app = createApp();
    expect(app).toBeTruthy();
  });
});
