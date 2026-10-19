import type { Request } from 'express';

import type { MerchantJwtClaims } from '../auth/jwt';
import { prisma } from '../db/prisma';

export const DEFAULT_MERCHANT_PUBLIC_ID = 'np_merchant_default';
/** ID interno do lojista padrão (migration phase1). Usado quando o banco não está disponível (testes). */
export const DEFAULT_MERCHANT_DB_ID = 'cmdefaultmerchant000000000001';

export type DashboardRequest = Request & {
  merchant?: MerchantJwtClaims;
  dashboardIsAdmin?: boolean;
};

export type MerchantApiRequest = Request & {
  merchantApiKeyAuth?: { merchantDbId: string; keyPublicId: string };
};

let defaultMerchantDbId: string | null = null;

export async function getDefaultMerchantDbId(): Promise<string> {
  if (defaultMerchantDbId) {
    return defaultMerchantDbId;
  }
  try {
    const row = await prisma.merchant.findUnique({
      where: { merchantPublicId: DEFAULT_MERCHANT_PUBLIC_ID },
      select: { id: true },
    });
    if (!row) {
      throw new Error(
        'Merchant padrão não encontrado. Execute `npx prisma migrate deploy` antes de iniciar a API.',
      );
    }
    defaultMerchantDbId = row.id;
    return row.id;
  } catch {
    return DEFAULT_MERCHANT_DB_ID;
  }
}

export async function resolveMerchantDbIdForWrite(req: DashboardRequest): Promise<string> {
  try {
    if (req.merchant?.merchantId) {
      const row = await prisma.merchant.findUnique({
        where: { merchantPublicId: req.merchant.merchantId },
        select: { id: true },
      });
      if (row) {
        return row.id;
      }
    }
  } catch {
    return DEFAULT_MERCHANT_DB_ID;
  }
  return getDefaultMerchantDbId();
}

/** Retorna filtro Prisma por merchant interno; `undefined` = admin vê todos os tenants. */
export async function resolveMerchantDbIdForRead(
  req: DashboardRequest,
): Promise<string | undefined> {
  if (req.dashboardIsAdmin) {
    return undefined;
  }
  try {
    if (req.merchant?.merchantId) {
      const row = await prisma.merchant.findUnique({
        where: { merchantPublicId: req.merchant.merchantId },
        select: { id: true },
      });
      if (row) {
        return row.id;
      }
    }
    return await getDefaultMerchantDbId();
  } catch {
    return undefined;
  }
}
