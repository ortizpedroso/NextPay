import { GatewayEnvironment, PrismaClient } from '@prisma/client';

export type CorrelationEntityType = 'pay' | 'cus';

export interface CorrelationStore {
  saveMapping(input: {
    neutralId: string;
    externalId: string;
    entityType: CorrelationEntityType;
    environment: GatewayEnvironment;
  }): Promise<void>;

  getExternalId(neutralId: string): Promise<string | null>;
}

export class PrismaCorrelationStore implements CorrelationStore {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMapping(input: {
    neutralId: string;
    externalId: string;
    entityType: CorrelationEntityType;
    environment: GatewayEnvironment;
  }): Promise<void> {
    await this.prisma.paymentIdMapping.upsert({
      where: { neutralId: input.neutralId },
      create: {
        neutralId: input.neutralId,
        externalId: input.externalId,
        entityType: input.entityType,
        environment: input.environment,
      },
      update: {
        externalId: input.externalId,
        entityType: input.entityType,
        environment: input.environment,
      },
    });
  }

  async getExternalId(neutralId: string): Promise<string | null> {
    const row = await this.prisma.paymentIdMapping.findUnique({
      where: { neutralId },
      select: { externalId: true },
    });
    return row?.externalId ?? null;
  }
}

export class InMemoryCorrelationStore implements CorrelationStore {
  private readonly map = new Map<string, string>();

  async saveMapping(input: {
    neutralId: string;
    externalId: string;
    entityType: CorrelationEntityType;
    environment: GatewayEnvironment;
  }): Promise<void> {
    this.map.set(input.neutralId, input.externalId);
  }

  async getExternalId(neutralId: string): Promise<string | null> {
    return this.map.get(neutralId) ?? null;
  }
}
