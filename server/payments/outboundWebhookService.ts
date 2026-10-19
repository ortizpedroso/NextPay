import { PrismaClient } from '@prisma/client';

export interface OutboundWebhookService {
  dispatch(eventType: string, payload: unknown): Promise<void>;
  processRetries?(now?: Date): Promise<{ attempted: number; delivered: number }>;
}

const RETRY_BASE_MS = 2_000;

function computeNextRetryAt(attemptCount: number, now = new Date()): Date {
  const delayMs = Math.min(RETRY_BASE_MS * 2 ** attemptCount, 5 * 60_000);
  return new Date(now.getTime() + delayMs);
}

export class PrismaOutboundWebhookService implements OutboundWebhookService {
  constructor(private readonly prisma: PrismaClient) {}

  async dispatch(eventType: string, payload: unknown): Promise<void> {
    const targetUrl = process.env.MERCHANT_WEBHOOK_URL?.trim();
    if (!targetUrl) {
      return;
    }

    const payloadJson = JSON.stringify({
      eventType,
      payload,
      emittedAt: new Date().toISOString(),
    });

    const delivery = await this.prisma.outboundWebhookDelivery.create({
      data: {
        targetUrl,
        eventType,
        payloadJson,
        status: 'QUEUED',
        attemptCount: 0,
        maxAttempts: 5,
      },
    });

    void this.deliverHttp(delivery.id, targetUrl, payloadJson, 0);
  }

  async processRetries(now = new Date()): Promise<{ attempted: number; delivered: number }> {
    const pending = await this.prisma.outboundWebhookDelivery.findMany({
      where: {
        status: { startsWith: 'RETRY_' },
        nextRetryAt: { lte: now },
      },
      take: 20,
    });

    let delivered = 0;
    for (const row of pending) {
      const ok = await this.deliverHttp(row.id, row.targetUrl, row.payloadJson, row.attemptCount);
      if (ok) {
        delivered += 1;
      }
    }
    return { attempted: pending.length, delivered };
  }

  private async deliverHttp(
    deliveryId: string,
    targetUrl: string,
    payloadJson: string,
    attemptCount: number,
  ): Promise<boolean> {
    const nextAttempt = attemptCount + 1;
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NextPay-Event-Source': 'nextpay-platform',
        },
        body: payloadJson,
        signal: AbortSignal.timeout(10_000),
      });

      if (response.ok) {
        await this.prisma.outboundWebhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'DELIVERED',
            attemptCount: nextAttempt,
            nextRetryAt: null,
          },
        });
        return true;
      }

      await this.scheduleRetry(deliveryId, nextAttempt, `FAILED_${response.status}`);
      return false;
    } catch {
      await this.scheduleRetry(deliveryId, nextAttempt, 'FAILED');
      return false;
    }
  }

  private async scheduleRetry(
    deliveryId: string,
    attemptCount: number,
    failureStatus: string,
  ): Promise<void> {
    const row = await this.prisma.outboundWebhookDelivery.findUnique({
      where: { id: deliveryId },
      select: { maxAttempts: true },
    });
    const maxAttempts = row?.maxAttempts ?? 5;
    if (attemptCount >= maxAttempts) {
      await this.prisma.outboundWebhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'FAILED_MAX_ATTEMPTS',
          attemptCount,
          nextRetryAt: null,
        },
      });
      return;
    }

    await this.prisma.outboundWebhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: `RETRY_${failureStatus}`,
        attemptCount,
        nextRetryAt: computeNextRetryAt(attemptCount),
      },
    });
  }
}

export class InMemoryOutboundWebhookService implements OutboundWebhookService {
  readonly deliveries: Array<{
    eventType: string;
    payload: unknown;
    targetUrl?: string;
  }> = [];

  async dispatch(eventType: string, payload: unknown): Promise<void> {
    this.deliveries.push({
      eventType,
      payload,
      targetUrl: process.env.MERCHANT_WEBHOOK_URL?.trim(),
    });
  }

  async processRetries(): Promise<{ attempted: number; delivered: number }> {
    return { attempted: 0, delivered: 0 };
  }
}

export class NoopOutboundWebhookService implements OutboundWebhookService {
  async dispatch(_eventType: string, _payload: unknown): Promise<void> {
    return;
  }
}
