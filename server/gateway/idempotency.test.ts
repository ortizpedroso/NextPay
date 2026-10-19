import { describe, expect, it } from 'vitest';

import { withIdempotency } from './idempotency';
import type { IdempotencyStore } from './payment-gateway.interface';

class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly data = new Map<string, { hash: string; response: string }>();

  async get(
    operation: string,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<string | null> {
    const key = `${operation}:${idempotencyKey}`;
    const row = this.data.get(key);
    if (!row) {
      return null;
    }
    if (row.hash !== requestHash) {
      throw new Error('IdempotencyConflictError');
    }
    return row.response;
  }

  async save(
    operation: string,
    idempotencyKey: string,
    requestHash: string,
    responseJson: string,
  ): Promise<void> {
    const key = `${operation}:${idempotencyKey}`;
    this.data.set(key, { hash: requestHash, response: responseJson });
  }
}

describe('withIdempotency', () => {
  it('retorna mesma resposta para mesma chave e payload', async () => {
    const store = new MemoryIdempotencyStore();
    let executions = 0;

    const run = () =>
      withIdempotency(
        store,
        'createPayment',
        'key-1',
        { amountCents: 100 },
        60_000,
        async () => {
          executions += 1;
          return { ok: true, value: 100 };
        },
        (r) => JSON.stringify(r),
        (json) => JSON.parse(json) as { ok: boolean; value: number },
      );

    const first = await run();
    const second = await run();

    expect(first).toEqual(second);
    expect(executions).toBe(1);
  });
});
