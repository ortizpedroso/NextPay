import { PrismaClient } from '@prisma/client';

export type LedgerEntry = {
  neutralPaymentId: string;
  amountCents: number;
  netAmountCents?: number | null;
  status: string;
  method: string;
  description: string;
  customerName?: string | null;
};

export interface LedgerStore {
  upsert(entry: LedgerEntry): Promise<void>;
  list(limit?: number): Promise<LedgerEntry[]>;
}

export class InMemoryLedgerStore implements LedgerStore {
  private readonly rows = new Map<string, LedgerEntry>();

  async upsert(entry: LedgerEntry): Promise<void> {
    this.rows.set(entry.neutralPaymentId, entry);
  }

  async list(limit = 50): Promise<LedgerEntry[]> {
    return Array.from(this.rows.values())
      .sort((a, b) => b.neutralPaymentId.localeCompare(a.neutralPaymentId))
      .slice(0, limit);
  }
}

export class PrismaLedgerStore implements LedgerStore {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(entry: LedgerEntry): Promise<void> {
    await this.prisma.ledgerTransaction.upsert({
      where: { neutralPaymentId: entry.neutralPaymentId },
      create: entry,
      update: entry,
    });
  }

  async list(limit = 50): Promise<LedgerEntry[]> {
    const rows = await this.prisma.ledgerTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((row) => ({
      neutralPaymentId: row.neutralPaymentId,
      amountCents: row.amountCents,
      netAmountCents: row.netAmountCents,
      status: row.status,
      method: row.method,
      description: row.description,
      customerName: row.customerName,
    }));
  }
}
