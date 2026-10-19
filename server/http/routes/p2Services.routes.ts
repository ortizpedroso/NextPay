import { Router } from 'express';
import { z } from 'zod';

import type { DashboardRequest } from '../../merchant/merchantScope';
import { resolveMerchantDbIdForRead } from '../../merchant/merchantScope';

const quoteSchema = z.object({
  receivableCents: z.number().int().positive(),
});

const tapDeviceSchema = z.object({
  label: z.string().min(2).max(120),
  serialNumber: z.string().min(4).max(64).optional(),
});

const nfEmitSchema = z.object({
  customerName: z.string().min(2).max(140),
  customerDocument: z.string().min(11).max(18),
  amountCents: z.number().int().positive(),
  description: z.string().min(2).max(500),
});

export function createP2ServicesRouter(): Router {
  const router = Router();

  router.post('/antecipacao/quote', async (req, res, next) => {
    try {
      const body = quoteSchema.parse(req.body);
      const feePercent = 2.49;
      const feeCents = Math.round(body.receivableCents * (feePercent / 100));
      const netCents = body.receivableCents - feeCents;
      res.json({
        quote: {
          receivableCents: body.receivableCents,
          feePercent,
          feeCents,
          netCents,
          settlementEtaHours: 24,
          stub: true,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/tap/devices', async (req, res, next) => {
    try {
      const body = tapDeviceSchema.parse(req.body);
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      res.status(201).json({
        device: {
          devicePublicId: `tap_dev_${Date.now().toString(36)}`,
          label: body.label,
          serialNumber: body.serialNumber ?? null,
          merchantScope: merchantDbId ?? 'default',
          status: 'REGISTERED',
          stub: true,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/notas-fiscais/emit', async (req, res, next) => {
    try {
      const body = nfEmitSchema.parse(req.body);
      res.status(202).json({
        request: {
          protocol: `nf_${Date.now().toString(36)}`,
          status: 'QUEUED',
          customerName: body.customerName,
          customerDocument: body.customerDocument,
          amountCents: body.amountCents,
          description: body.description,
          stub: true,
          message: 'Emissão enfileirada (stub). Integração fiscal real não configurada.',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
