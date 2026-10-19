import { PrismaClient } from '@prisma/client';

export interface OutboundWebhookService {
  dispatch(eventType: string, payload: unknown): Promise<void>;
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
      },
    });

    void this.deliverHttp(delivery.id, targetUrl, payloadJson);
  }

  private async deliverHttp(deliveryId: string, targetUrl: string, payloadJson: string): Promise<void> {
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

      await this.prisma.outboundWebhookDelivery.update({
        where: { id: deliveryId },
        data: { status: response.ok ? 'DELIVERED' : `FAILED_${response.status}` },
      });
    } catch {
      await this.prisma.outboundWebhookDelivery
        .update({
          where: { id: deliveryId },
          data: { status: 'FAILED' },
        })
        .catch(() => undefined);
    }
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
}

export class NoopOutboundWebhookService implements OutboundWebhookService {
  async dispatch(_eventType: string, _payload: unknown): Promise<void> {
    return;
  }
}
