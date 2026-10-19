import { Router } from 'express';

export function createMerchantRouter(): Router {
  const router = Router();

  router.get('/profile', (_req, res) => {
    res.json({
      merchant: {
        name: 'NextPay Merchant',
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
        capabilities: ['payments', 'checkout', 'webhooks'],
      },
    });
  });

  return router;
}
