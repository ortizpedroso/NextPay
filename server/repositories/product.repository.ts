import { prisma } from '../db.js';
import { BillingType, Prisma } from '@prisma/client';

export interface ProductFilter {
  accountId: string;
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  active?: boolean;
}

export async function listProducts({
  accountId,
  page = 1,
  pageSize = 10,
  q,
  category,
  active,
}: ProductFilter) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.ProductWhereInput = {
    accountId,
    ...(active !== undefined ? { active } : {}),
    ...(category && category !== 'todos' ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { paymentLinks: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findProductById(id: string, accountId: string) {
  return prisma.product.findFirst({
    where: { id, accountId },
    include: {
      paymentLinks: true,
    },
  });
}

export async function createProduct(data: {
  accountId: string;
  title: string;
  description?: string | null;
  category?: string;
  priceCents: number;
  billingType?: BillingType;
  cycle?: string | null;
  imageUrl?: string | null;
  active?: boolean;
}) {
  return prisma.product.create({
    data,
  });
}

export async function updateProduct(
  id: string,
  accountId: string,
  data: {
    title?: string;
    description?: string | null;
    category?: string;
    priceCents?: number;
    billingType?: BillingType;
    cycle?: string | null;
    imageUrl?: string | null;
    active?: boolean;
  },
) {
  const existing = await prisma.product.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string, accountId: string) {
  const existing = await prisma.product.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.product.delete({
    where: { id },
  });
}
