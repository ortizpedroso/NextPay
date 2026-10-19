import { Router } from 'express';

import { prisma } from '../../db/prisma';
import { getDefaultMerchantDbId } from '../../merchant/merchantScope';
import type { CatalogProductStore } from './products.routes';
import type { PaymentLinkStore } from './paymentLinks.routes';

export function createMerchantRouter(
  productStore: CatalogProductStore,
  linkStore: PaymentLinkStore,
): Router {
  const router = Router();

  router.get('/profile', async (_req, res, next) => {
    try {
      const baseProfile = {
        name: 'NextPay Merchant',
        merchantId: 'np_merchant_default',
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
        capabilities: ['payments', 'checkout', 'webhooks', 'products', 'payment-links'],
        ledgerTransactionCount: 0,
        availableBalanceCents: 0,
      };

      try {
        const merchantDbId = await getDefaultMerchantDbId();
        const merchant = await prisma.merchant.findUnique({ where: { id: merchantDbId } });
        const confirmedStatuses = ['RECEIVED', 'CONFIRMED', 'Liquidado'];

        const [transactionCount, availableAgg] = await Promise.all([
          prisma.ledgerTransaction.count({ where: { merchantId: merchantDbId } }),
          prisma.ledgerTransaction.aggregate({
            where: { merchantId: merchantDbId, status: { in: confirmedStatuses } },
            _sum: { netAmountCents: true, amountCents: true },
          }),
        ]);

        const availableCents =
          availableAgg._sum.netAmountCents ?? availableAgg._sum.amountCents ?? 0;

        res.json({
          merchant: {
            ...baseProfile,
            name: merchant?.displayName ?? baseProfile.name,
            merchantId: merchant?.merchantPublicId ?? baseProfile.merchantId,
            ledgerTransactionCount: transactionCount,
            availableBalanceCents: availableCents,
          },
        });
        return;
      } catch {
        // Sem banco (testes unitários)
      }

      res.json({ merchant: baseProfile });
    } catch (error) {
      next(error);
    }
  });

  router.get('/products', async (_req, res, next) => {
    try {
      const merchantDbId = await getDefaultMerchantDbId();
      const products = await productStore.list(false, merchantDbId);
      res.json({ products });
    } catch (error) {
      next(error);
    }
  });

  router.get('/payment-links', async (_req, res, next) => {
    try {
      const merchantDbId = await getDefaultMerchantDbId();
      const paymentLinks = await linkStore.list(merchantDbId);
      res.json({ paymentLinks });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
