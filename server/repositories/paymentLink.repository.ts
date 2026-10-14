import { prisma } from '../db.js';
import { BillingType, Prisma } from '@prisma/client';

export interface PaymentLinkFilter {
  accountId: string;
  page?: number;
  pageSize?: number;
  q?: string;
  type?: BillingType;
  active?: boolean;
}

export async function listPaymentLinks({
  accountId,
  page = 1,
  pageSize = 10,
  q,
  type,
  active,
}: PaymentLinkFilter) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.PaymentLinkWhereInput = {
    accountId,
    ...(active !== undefined ? { active } : {}),
    ...(type ? { billingType: type } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.paymentLink.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        _count: {
          select: { charges: true },
        },
      },
    }),
    prisma.paymentLink.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findPaymentLinkById(id: string, accountId: string) {
  return prisma.paymentLink.findFirst({
    where: { id, accountId },
    include: {
      product: true,
      charges: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function findPaymentLinkBySlug(slug: string) {
  return prisma.paymentLink.findFirst({
    where: { slug, active: true },
    include: { product: true },
  });
}

export async function createPaymentLink(data: {
  accountId: string;
  productId?: string | null;
  title: string;
  description?: string | null;
  amountCents: number;
  billingType?: BillingType;
  slug?: string;
  active?: boolean;
  maxInstallments?: number;
  enablePix?: boolean;
  enableCard?: boolean;
  enableBoleto?: boolean;
}) {
  const generatedSlug =
    data.slug ||
    `${data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}-${Date.now().toString().slice(-4)}`;

  return prisma.paymentLink.create({
    data: {
      ...data,
      slug: generatedSlug,
    },
    include: { product: true },
  });
}

export async function updatePaymentLink(
  id: string,
  accountId: string,
  data: {
    title?: string;
    description?: string | null;
    amountCents?: number;
    billingType?: BillingType;
    active?: boolean;
    maxInstallments?: number;
    enablePix?: boolean;
    enableCard?: boolean;
    enableBoleto?: boolean;
  },
) {
  const existing = await prisma.paymentLink.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.paymentLink.update({
    where: { id },
    data,
    include: { product: true },
  });
}

export async function deletePaymentLink(id: string, accountId: string) {
  const existing = await prisma.paymentLink.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.paymentLink.delete({
    where: { id },
  });
}
