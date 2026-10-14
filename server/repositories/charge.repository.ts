import { prisma } from '../db.js';
import { PaymentMethod, ChargeStatus, Prisma } from '@prisma/client';

export interface ChargeFilter {
  accountId: string;
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ChargeStatus;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
}

export async function listCharges({
  accountId,
  page = 1,
  pageSize = 10,
  q,
  status,
  method,
  startDate,
  endDate,
}: ChargeFilter) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.ChargeWhereInput = {
    accountId,
    ...(status ? { status } : {}),
    ...(method ? { method } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: 'insensitive' } },
            { customer: { name: { contains: q, mode: 'insensitive' } } },
            { customer: { cpfCnpj: { contains: q, mode: 'insensitive' } } },
            { id: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.charge.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        paymentLink: true,
      },
    }),
    prisma.charge.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function findChargeById(id: string, accountId: string) {
  return prisma.charge.findFirst({
    where: { id, accountId },
    include: {
      customer: true,
      paymentLink: true,
    },
  });
}

export async function createCharge(data: {
  accountId: string;
  customerId?: string | null;
  paymentLinkId?: string | null;
  description: string;
  amountCents: number;
  method: PaymentMethod;
  dueDate: Date;
  status?: ChargeStatus;
  feeCents?: number;
  netCents?: number;
  asaasId?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  boletoBarcode?: string | null;
  boletoUrl?: string | null;
}) {
  // Se taxas não forem fornecidas, calcular taxa estimada NextPay (ex: R$ 2,48 fixo + 1%)
  const feeCents =
    data.feeCents ??
    (data.method === PaymentMethod.PIX
      ? Math.round(data.amountCents * 0.01 + 248)
      : data.method === PaymentMethod.BOLETO
        ? Math.round(data.amountCents * 0.01 + 248)
        : Math.round(data.amountCents * 0.0399 + 98));

  const netCents = data.netCents ?? Math.max(0, data.amountCents - feeCents);

  return prisma.charge.create({
    data: {
      ...data,
      status: data.status || ChargeStatus.PENDING,
      feeCents,
      netCents,
    },
    include: {
      customer: true,
      paymentLink: true,
    },
  });
}
