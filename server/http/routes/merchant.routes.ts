import { Router } from 'express';

import type { CatalogProductStore } from './products.routes';
import type { PaymentLinkStore } from './paymentLinks.routes';

export function createMerchantRouter(
  productStore: CatalogProductStore,
  linkStore: PaymentLinkStore,
): Router {
  const router = Router();

  router.get('/profile', (_req, res) => {
    res.json({
      merchant: {
        name: 'NextPay Merchant',
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
        capabilities: ['payments', 'checkout', 'webhooks', 'products', 'payment-links'],
      },
    });
  });

  router.get('/products', async (_req, res, next) => {
    try {
      const products = await productStore.list(false);
      res.json({ products });
    } catch (error) {
      next(error);
    }
  });

  router.get('/payment-links', async (_req, res, next) => {
    try {
      const paymentLinks = await linkStore.list();
      res.json({ paymentLinks });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
