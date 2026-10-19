import { GatewayEnvironment, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export type CheckoutSessionRecord = {
  merchantId?: string;
  sessionPublicId: string;
  amountCents: number;
  description: string;
  method: string;
  status: string;
  paymentId?: string | null;
  pixCopyPaste?: string | null;
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  paymentLinkPublicId?: string | null;
  productPublicId?: string | null;
  environment: GatewayEnvironment;
};

export interface CheckoutSessionStore {
  create(record: CheckoutSessionRecord): Promise<CheckoutSessionRecord>;
  getByPublicId(sessionPublicId: string): Promise<CheckoutSessionRecord | null>;
  getByPaymentId(paymentId: string): Promise<CheckoutSessionRecord | null>;
  updateByPaymentId(paymentId: string, status: string): Promise<CheckoutSessionRecord | null>;
}

export class InMemoryCheckoutSessionStore implements CheckoutSessionStore {
  private readonly rows = new Map<string, CheckoutSessionRecord>();

  async create(record: CheckoutSessionRecord): Promise<CheckoutSessionRecord> {
    this.rows.set(record.sessionPublicId, record);
    return record;
  }

  async getByPublicId(sessionPublicId: string): Promise<CheckoutSessionRecord | null> {
    return this.rows.get(sessionPublicId) ?? null;
  }

  async getByPaymentId(paymentId: string): Promise<CheckoutSessionRecord | null> {
    for (const row of this.rows.values()) {
      if (row.paymentId === paymentId) {
        return row;
      }
    }
    return null;
  }

  async updateByPaymentId(
    paymentId: string,
    status: string,
  ): Promise<CheckoutSessionRecord | null> {
    for (const [key, row] of this.rows.entries()) {
      if (row.paymentId === paymentId) {
        const updated = { ...row, status };
        this.rows.set(key, updated);
        return updated;
      }
    }
    return null;
  }
}

export class PrismaCheckoutSessionStore implements CheckoutSessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async create(record: CheckoutSessionRecord): Promise<CheckoutSessionRecord> {
    const { getDefaultMerchantDbId } = await import('../merchant/merchantScope');
    const merchantId = record.merchantId ?? (await getDefaultMerchantDbId());
    await this.prisma.checkoutSession.create({
      data: {
        merchantId,
        sessionPublicId: record.sessionPublicId,
        amountCents: record.amountCents,
        description: record.description,
        method: record.method,
        status: record.status,
        paymentId: record.paymentId ?? null,
        pixCopyPaste: record.pixCopyPaste ?? null,
        customerName: record.customerName,
        customerEmail: record.customerEmail,
        customerDocument: record.customerDocument,
        paymentLinkPublicId: record.paymentLinkPublicId ?? null,
        productPublicId: record.productPublicId ?? null,
        environment: record.environment,
      },
    });
    return { ...record, merchantId };
  }

  async getByPublicId(sessionPublicId: string): Promise<CheckoutSessionRecord | null> {
    const row = await this.prisma.checkoutSession.findUnique({
      where: { sessionPublicId },
    });
    return row ? mapRow(row) : null;
  }

  async getByPaymentId(paymentId: string): Promise<CheckoutSessionRecord | null> {
    const row = await this.prisma.checkoutSession.findFirst({
      where: { paymentId },
    });
    return row ? mapRow(row) : null;
  }

  async updateByPaymentId(
    paymentId: string,
    status: string,
  ): Promise<CheckoutSessionRecord | null> {
    const row = await this.prisma.checkoutSession.findFirst({
      where: { paymentId },
    });
    if (!row) {
      return null;
    }
    const updated = await this.prisma.checkoutSession.update({
      where: { id: row.id },
      data: { status },
    });
    return mapRow(updated);
  }
}

export function newCheckoutPublicId(): string {
  return `cs_${randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function mapRow(row: {
  sessionPublicId: string;
  amountCents: number;
  description: string;
  method: string;
  status: string;
  paymentId: string | null;
  pixCopyPaste: string | null;
  customerName: string;
  customerEmail: string;
  customerDocument: string;
  paymentLinkPublicId?: string | null;
  productPublicId?: string | null;
  environment: GatewayEnvironment;
}): CheckoutSessionRecord {
  return {
    sessionPublicId: row.sessionPublicId,
    amountCents: row.amountCents,
    description: row.description,
    method: row.method,
    status: row.status,
    paymentId: row.paymentId,
    pixCopyPaste: row.pixCopyPaste,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerDocument: row.customerDocument,
    paymentLinkPublicId: row.paymentLinkPublicId ?? null,
    productPublicId: row.productPublicId ?? null,
    environment: row.environment,
  };
}
