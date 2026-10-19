import { PrismaClient } from '@prisma/client';

import { IdempotencyConflictError } from '../gateway/idempotency';
import type { IdempotencyStore } from '../gateway/payment-gateway.interface';

export class PrismaIdempotencyStore implements IdempotencyStore {
  constructor(private readonly prisma: PrismaClient) {}

  async get(
    operation: string,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<string | null> {
    const row = await this.prisma.paymentIdempotencyKey.findUnique({
      where: { idempotencyKey },
    });
    if (!row) {
      return null;
    }
    if (row.operation !== operation || row.requestHash !== requestHash) {
      throw new IdempotencyConflictError();
    }
    if (row.expiresAt.getTime() <= Date.now()) {
      return null;
    }
    return row.responseJson;
  }

  async save(
    operation: string,
    idempotencyKey: string,
    requestHash: string,
    responseJson: string,
    ttlMs: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMs);
    try {
      await this.prisma.paymentIdempotencyKey.create({
        data: {
          idempotencyKey,
          operation,
          requestHash,
          responseJson,
          expiresAt,
        },
      });
    } catch {
      const existing = await this.get(operation, idempotencyKey, requestHash);
      if (existing === null) {
        throw new IdempotencyConflictError();
      }
    }
  }
}
