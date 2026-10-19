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
  upsert(entry: LedgerEntry, merchantDbId?: string): Promise<void>;
  list(limit?: number, merchantDbId?: string): Promise<LedgerEntry[]>;
}

export class InMemoryLedgerStore implements LedgerStore {
  private readonly rows = new Map<string, LedgerEntry>();

  private readonly merchantByPayment = new Map<string, string>();

  async upsert(entry: LedgerEntry, merchantDbId?: string): Promise<void> {
    this.rows.set(entry.neutralPaymentId, entry);
    if (merchantDbId) {
      this.merchantByPayment.set(entry.neutralPaymentId, merchantDbId);
    }
  }

  async list(limit = 50, merchantDbId?: string): Promise<LedgerEntry[]> {
    return Array.from(this.rows.values())
      .filter((row) => {
        if (!merchantDbId) {
          return true;
        }
        const scoped = this.merchantByPayment.get(row.neutralPaymentId);
        return !scoped || scoped === merchantDbId;
      })
      .sort((a, b) => b.neutralPaymentId.localeCompare(a.neutralPaymentId))
      .slice(0, limit);
  }
}

export class PrismaLedgerStore implements LedgerStore {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(entry: LedgerEntry, merchantDbId?: string): Promise<void> {
    const { getDefaultMerchantDbId } = await import('../merchant/merchantScope');
    const merchantId = merchantDbId ?? (await getDefaultMerchantDbId());
    await this.prisma.ledgerTransaction.upsert({
      where: { neutralPaymentId: entry.neutralPaymentId },
      create: { ...entry, merchantId },
      update: { ...entry, merchantId },
    });
  }

  async list(limit = 50, merchantDbId?: string): Promise<LedgerEntry[]> {
    const rows = await this.prisma.ledgerTransaction.findMany({
      where: merchantDbId ? { merchantId: merchantDbId } : undefined,
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
