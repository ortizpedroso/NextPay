import { Router } from 'express';
import { z } from 'zod';

import type { LedgerStore } from '../../payments/ledgerStore';
import { getDefaultMerchantDbId } from '../../merchant/merchantScope';

const simulateSaleSchema = z.object({
  amountCents: z.number().int().positive().max(50_000_000),
  description: z.string().min(1).max(200).default('Venda simulada (sandbox)'),
  customerName: z.string().min(2).max(140).default('Cliente Sandbox'),
});

export function createSandboxRouter(ledgerStore: LedgerStore): Router {
  const router = Router();

  router.post('/simulate-sale', async (req, res, next) => {
    try {
      const body = simulateSaleSchema.parse(req.body ?? {});
      const merchantId = await getDefaultMerchantDbId();
      const paymentId = `np_pay_sim_${Date.now().toString(36)}`;

      await ledgerStore.upsert(
        {
          neutralPaymentId: paymentId,
          amountCents: body.amountCents,
          netAmountCents: body.amountCents,
          status: 'RECEIVED',
          method: 'PIX',
          description: body.description,
          customerName: body.customerName,
        },
        merchantId,
      );

      res.status(201).json({
        simulated: true,
        paymentId,
        amountCents: body.amountCents,
        status: 'RECEIVED',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
