import type { IdempotencyStore } from '../gateway/payment-gateway.interface';

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly rows = new Map<string, { hash: string; response: string }>();

  async get(operation: string, idempotencyKey: string, requestHash: string): Promise<string | null> {
    const key = `${operation}:${idempotencyKey}`;
    const row = this.rows.get(key);
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
    _ttlMs: number,
  ): Promise<void> {
    const key = `${operation}:${idempotencyKey}`;
    this.rows.set(key, { hash: requestHash, response: responseJson });
  }
}
