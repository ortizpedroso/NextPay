import { prisma } from '../db.js';
import { Prisma } from '@prisma/client';

export interface CustomerFilter {
  accountId: string;
  page?: number;
  pageSize?: number;
  q?: string;
}

export async function listCustomers({ accountId, page = 1, pageSize = 10, q }: CustomerFilter) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.CustomerWhereInput = {
    accountId,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { cpfCnpj: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { charges: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findCustomerById(id: string, accountId: string) {
  return prisma.customer.findFirst({
    where: { id, accountId },
    include: {
      charges: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function createCustomer(data: {
  accountId: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  return prisma.customer.create({
    data,
  });
}

export async function updateCustomer(
  id: string,
  accountId: string,
  data: {
    name?: string;
    cpfCnpj?: string;
    email?: string;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
  },
) {
  const existing = await prisma.customer.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string, accountId: string) {
  const existing = await prisma.customer.findFirst({
    where: { id, accountId },
  });
  if (!existing) return null;

  return prisma.customer.delete({
    where: { id },
  });
}
