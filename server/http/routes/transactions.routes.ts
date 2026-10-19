import { Router } from 'express';

import type { DashboardRequest } from '../../merchant/merchantScope';
import { resolveMerchantDbIdForRead } from '../../merchant/merchantScope';
import type { LedgerStore } from '../../payments/ledgerStore';

export function createTransactionsRouter(ledgerStore: LedgerStore): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const transactions = await ledgerStore.list(100, merchantDbId);
      res.json({ transactions });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
