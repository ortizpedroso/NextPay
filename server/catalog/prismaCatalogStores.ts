import { PrismaClient } from '@prisma/client';

import { buildCheckoutUrl } from './catalogIds';
import type {
  CatalogProductRecord,
  CatalogProductStore,
} from '../http/routes/products.routes';
import type { PaymentLinkRecord, PaymentLinkStore } from '../http/routes/paymentLinks.routes';

function mapProduct(row: {
  productPublicId: string;
  urlSlug: string;
  title: string;
  description: string;
  category: string;
  badge: string | null;
  priceCents: number;
  billingType: string;
  recurrencyCycle: string | null;
  maxInstallments: number;
  imageUrl: string;
  salesCount: number;
  status: string;
}): CatalogProductRecord {
  return {
    productPublicId: row.productPublicId,
    urlSlug: row.urlSlug,
    title: row.title,
    description: row.description,
    category: row.category as CatalogProductRecord['category'],
    badge: row.badge,
    priceCents: row.priceCents,
    billingType: row.billingType as CatalogProductRecord['billingType'],
    recurrencyCycle: row.recurrencyCycle,
    maxInstallments: row.maxInstallments,
    imageUrl: row.imageUrl,
    salesCount: row.salesCount,
    status: row.status as CatalogProductRecord['status'],
    checkoutUrl: buildCheckoutUrl(row.urlSlug),
  };
}

function mapLink(row: {
  linkPublicId: string;
  urlSlug: string;
  title: string;
  subtitle: string;
  billingType: string;
  status: string;
  amountCents: number;
  totalBilledCents: number;
  salesCount: number;
  viewCount: number;
  expiresAt: Date | null;
  productPublicId: string | null;
}): PaymentLinkRecord {
  return {
    linkPublicId: row.linkPublicId,
    urlSlug: row.urlSlug,
    title: row.title,
    subtitle: row.subtitle,
    billingType: row.billingType as PaymentLinkRecord['billingType'],
    status: row.status as PaymentLinkRecord['status'],
    amountCents: row.amountCents,
    totalBilledCents: row.totalBilledCents,
    salesCount: row.salesCount,
    viewCount: row.viewCount,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    productPublicId: row.productPublicId,
    checkoutUrl: buildCheckoutUrl(row.urlSlug),
  };
}

export class PrismaCatalogProductStore implements CatalogProductStore {
  constructor(private readonly prisma: PrismaClient) {}

  async list(includeArchived = false): Promise<CatalogProductRecord[]> {
    const rows = await this.prisma.catalogProduct.findMany({
      where: includeArchived ? undefined : { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map(mapProduct);
  }

  async getByPublicId(productPublicId: string): Promise<CatalogProductRecord | null> {
    const row = await this.prisma.catalogProduct.findUnique({
      where: { productPublicId },
    });
    return row ? mapProduct(row) : null;
  }

  async getBySlugOrPublicId(slugOrId: string): Promise<CatalogProductRecord | null> {
    const byId = await this.prisma.catalogProduct.findUnique({
      where: { productPublicId: slugOrId },
    });
    if (byId) {
      return mapProduct(byId);
    }
    const bySlug = await this.prisma.catalogProduct.findUnique({
      where: { urlSlug: slugOrId },
    });
    return bySlug ? mapProduct(bySlug) : null;
  }

  async incrementSales(productPublicId: string): Promise<void> {
    await this.prisma.catalogProduct.updateMany({
      where: { productPublicId },
      data: { salesCount: { increment: 1 } },
    });
  }

  async create(
    input: Omit<CatalogProductRecord, 'checkoutUrl' | 'salesCount' | 'status'> & {
      productPublicId: string;
      urlSlug: string;
    },
  ): Promise<CatalogProductRecord> {
    const row = await this.prisma.catalogProduct.create({
      data: {
        productPublicId: input.productPublicId,
        urlSlug: input.urlSlug,
        title: input.title,
        description: input.description,
        category: input.category,
        badge: input.badge ?? null,
        priceCents: input.priceCents,
        billingType: input.billingType,
        recurrencyCycle: input.recurrencyCycle ?? null,
        maxInstallments: input.maxInstallments,
        imageUrl: input.imageUrl,
        salesCount: 0,
        status: 'ACTIVE',
      },
    });
    return mapProduct(row);
  }

  async update(
    productPublicId: string,
    patch: Parameters<CatalogProductStore['update']>[1],
  ): Promise<CatalogProductRecord | null> {
    try {
      const row = await this.prisma.catalogProduct.update({
        where: { productPublicId },
        data: {
          title: patch.title,
          description: patch.description,
          category: patch.category,
          badge: patch.badge,
          priceCents: patch.priceCents,
          billingType: patch.billingType,
          recurrencyCycle: patch.recurrencyCycle,
          maxInstallments: patch.maxInstallments,
          imageUrl: patch.imageUrl,
          status: patch.status,
          urlSlug: patch.urlSlug,
        },
      });
      return mapProduct(row);
    } catch {
      return null;
    }
  }
}

export class PrismaPaymentLinkStore implements PaymentLinkStore {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<PaymentLinkRecord[]> {
    const rows = await this.prisma.paymentLink.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map(mapLink);
  }

  async getByPublicId(linkPublicId: string): Promise<PaymentLinkRecord | null> {
    const row = await this.prisma.paymentLink.findUnique({
      where: { linkPublicId },
    });
    return row ? mapLink(row) : null;
  }

  async getBySlugOrPublicId(slugOrId: string): Promise<PaymentLinkRecord | null> {
    const byId = await this.prisma.paymentLink.findUnique({
      where: { linkPublicId: slugOrId },
    });
    if (byId) {
      return mapLink(byId);
    }
    const bySlug = await this.prisma.paymentLink.findUnique({
      where: { urlSlug: slugOrId },
    });
    return bySlug ? mapLink(bySlug) : null;
  }

  async recordConfirmedSale(linkPublicId: string, amountCents: number): Promise<void> {
    await this.prisma.paymentLink.updateMany({
      where: { linkPublicId },
      data: {
        salesCount: { increment: 1 },
        totalBilledCents: { increment: amountCents },
      },
    });
  }

  async create(input: {
    linkPublicId: string;
    urlSlug: string;
    title: string;
    subtitle: string;
    billingType: PaymentLinkRecord['billingType'];
    amountCents: number;
    expiresAt?: Date | null;
    productPublicId?: string | null;
  }): Promise<PaymentLinkRecord> {
    const row = await this.prisma.paymentLink.create({
      data: {
        linkPublicId: input.linkPublicId,
        urlSlug: input.urlSlug,
        title: input.title,
        subtitle: input.subtitle,
        billingType: input.billingType,
        status: 'ACTIVE',
        amountCents: input.amountCents,
        totalBilledCents: 0,
        salesCount: 0,
        viewCount: 0,
        expiresAt: input.expiresAt ?? null,
        productPublicId: input.productPublicId ?? null,
      },
    });
    return mapLink(row);
  }

  async update(
    linkPublicId: string,
    patch: Parameters<PaymentLinkStore['update']>[1],
  ): Promise<PaymentLinkRecord | null> {
    try {
      const row = await this.prisma.paymentLink.update({
        where: { linkPublicId },
        data: {
          title: patch.title,
          subtitle: patch.subtitle,
          billingType: patch.billingType,
          status: patch.status,
          amountCents: patch.amountCents,
          expiresAt:
            patch.expiresAt === undefined
              ? undefined
              : patch.expiresAt === null
                ? null
                : new Date(patch.expiresAt),
          urlSlug: patch.urlSlug,
        },
      });
      return mapLink(row);
    } catch {
      return null;
    }
  }

  async incrementView(linkPublicId: string): Promise<void> {
    await this.prisma.paymentLink.updateMany({
      where: { linkPublicId },
      data: { viewCount: { increment: 1 } },
    });
  }
}
