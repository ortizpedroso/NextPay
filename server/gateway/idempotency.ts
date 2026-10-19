import { createHash } from 'node:crypto';

import type { IdempotencyStore } from './payment-gateway.interface';

export function hashIdempotentRequest(payload: unknown): string {
  const stable = JSON.stringify(payload);
  return createHash('sha256').update(stable).digest('hex');
}

export class IdempotencyConflictError extends Error {
  constructor(message = 'Idempotency key já utilizada com payload diferente.') {
    super(message);
    this.name = 'IdempotencyConflictError';
  }
}

/**
 * Executa operação com garantia de idempotência quando store está configurado.
 */
export async function withIdempotency<T>(
  store: IdempotencyStore | undefined,
  operation: string,
  idempotencyKey: string,
  requestPayload: unknown,
  ttlMs: number,
  execute: () => Promise<T>,
  serialize: (result: T) => string,
  deserialize: (json: string) => T,
): Promise<T> {
  if (!store) {
    return execute();
  }

  const requestHash = hashIdempotentRequest(requestPayload);
  const cached = await store.get(operation, idempotencyKey, requestHash);
  if (cached !== null) {
    return deserialize(cached);
  }

  const result = await execute();
  await store.save(operation, idempotencyKey, requestHash, serialize(result), ttlMs);
  return result;
}
