import { PrismaClient } from '@prisma/client';

import type {
  MerchantCustomerRecord,
  MerchantCustomerStore,
} from '../http/routes/customers.routes';

export class PrismaMerchantCustomerStore implements MerchantCustomerStore {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<MerchantCustomerRecord[]> {
    const rows = await this.prisma.merchantCustomer.findMany({
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

  async save(record: MerchantCustomerRecord): Promise<void> {
    await this.prisma.merchantCustomer.upsert({
      where: { neutralCustomerId: record.neutralCustomerId },
      create: record,
      update: record,
    });
  }
}
