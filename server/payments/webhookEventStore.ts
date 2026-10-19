import { PrismaClient } from '@prisma/client';

export interface WebhookEventStore {
  hasProcessed(fingerprint: string): Promise<boolean>;
  markProcessed(input: {
    fingerprint: string;
    eventType: string;
    payloadJson: string;
  }): Promise<void>;
}

export class PrismaWebhookEventStore implements WebhookEventStore {
  constructor(private readonly prisma: PrismaClient) {}

  async hasProcessed(fingerprint: string): Promise<boolean> {
    const row = await this.prisma.inboundWebhookEvent.findUnique({
      where: { eventFingerprint: fingerprint },
      select: { id: true },
    });
    return Boolean(row);
  }

  async markProcessed(input: {
    fingerprint: string;
    eventType: string;
    payloadJson: string;
  }): Promise<void> {
    await this.prisma.inboundWebhookEvent.create({
      data: {
        eventFingerprint: input.fingerprint,
        eventType: input.eventType,
        payloadJson: input.payloadJson,
      },
    });
  }
}

export class InMemoryWebhookEventStore implements WebhookEventStore {
  private readonly seen = new Set<string>();

  async hasProcessed(fingerprint: string): Promise<boolean> {
    return this.seen.has(fingerprint);
  }

  async markProcessed(input: {
    fingerprint: string;
    eventType: string;
    payloadJson: string;
  }): Promise<void> {
    this.seen.add(input.fingerprint);
  }
}
