import { PrismaClient } from '@prisma/client';

import type {
  MerchantCustomerRecord,
  MerchantCustomerStore,
} from '../http/routes/customers.routes';

export class PrismaMerchantCustomerStore implements MerchantCustomerStore {
  constructor(private readonly prisma: PrismaClient) {}

  async list(merchantDbId?: string): Promise<MerchantCustomerRecord[]> {
    const rows = await this.prisma.merchantCustomer.findMany({
      where: merchantDbId ? { merchantId: merchantDbId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => ({
      neutralCustomerId: row.neutralCustomerId,
      name: row.name,
      email: row.email,
      document: row.document,
    }));
  }

  async save(record: MerchantCustomerRecord, merchantDbId: string): Promise<void> {
    await this.prisma.merchantCustomer.upsert({
      where: { neutralCustomerId: record.neutralCustomerId },
      create: { ...record, merchantId: merchantDbId },
      update: { ...record, merchantId: merchantDbId },
    });
  }
}
