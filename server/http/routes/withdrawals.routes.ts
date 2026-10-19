import { Router } from 'express';
import { z } from 'zod';

import type { DashboardRequest } from '../../merchant/merchantScope';
import { resolveMerchantDbIdForRead, resolveMerchantDbIdForWrite } from '../../merchant/merchantScope';
import {
  createWithdrawalRequest,
  getWithdrawalRequest,
  listWithdrawalRequests,
} from '../../payments/withdrawalService';

const withdrawalSchema = z.object({
  amountCents: z.number().int().positive(),
  pixKey: z.string().min(5).max(180),
});

export function createWithdrawalsRouter(): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const withdrawals = await listWithdrawalRequests(merchantDbId);
      res.json({ withdrawals });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:protocol', async (req, res, next) => {
    try {
      const protocol = z.string().min(4).parse(req.params.protocol);
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const row = await getWithdrawalRequest(merchantDbId, protocol);
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
      const merchantDbId = await resolveMerchantDbIdForWrite(req as DashboardRequest);
      const record = await createWithdrawalRequest(merchantDbId, body);
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
