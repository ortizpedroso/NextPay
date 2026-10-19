import { Router } from 'express';

import type { LedgerStore } from '../../payments/ledgerStore';

export function createTransactionsRouter(ledgerStore: LedgerStore): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const transactions = await ledgerStore.list(100);
      res.json({ transactions });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
