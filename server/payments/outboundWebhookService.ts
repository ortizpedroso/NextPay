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

    await this.prisma.outboundWebhookDelivery.create({
      data: {
        targetUrl,
        eventType,
        payloadJson: JSON.stringify(payload),
        status: 'QUEUED',
      },
    });
  }
}

export class NoopOutboundWebhookService implements OutboundWebhookService {
  async dispatch(_eventType: string, _payload: unknown): Promise<void> {
    return;
  }
}
