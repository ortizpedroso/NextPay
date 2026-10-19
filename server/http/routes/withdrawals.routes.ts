import { Router } from 'express';
import { z } from 'zod';

import {
  enqueueWithdrawalStub,
  getWithdrawalStub,
  listWithdrawalStubs,
} from '../../payments/withdrawalStubStore';

const withdrawalSchema = z.object({
  amountCents: z.number().int().positive(),
  pixKey: z.string().min(5).max(180),
});

export function createWithdrawalsRouter(): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      res.json({ withdrawals: listWithdrawalStubs() });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:protocol', async (req, res, next) => {
    try {
      const protocol = z.string().min(4).parse(req.params.protocol);
      const row = getWithdrawalStub(protocol);
      if (!row) {
        res.status(404).json({ error: 'Saque não encontrado.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ withdrawal: row });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = withdrawalSchema.parse(req.body);
      const record = enqueueWithdrawalStub(body);
      res.status(202).json({
        status: record.status,
        protocol: record.protocol,
        amountCents: record.amountCents,
        message: record.message,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
