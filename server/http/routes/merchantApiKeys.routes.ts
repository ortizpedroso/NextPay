import { Router } from 'express';

import { prisma } from '../../db/prisma';
import type { DashboardRequest } from '../../merchant/merchantScope';
import { resolveMerchantDbIdForWrite } from '../../merchant/merchantScope';
import { listMerchantApiKeys, rotateMerchantApiKey } from '../../merchant/merchantApiKeys';

export function createMerchantApiKeysRouter(): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForWrite(req as DashboardRequest);
      const apiKeys = await listMerchantApiKeys(prisma, merchantDbId);
      res.json({ apiKeys });
    } catch (error) {
      next(error);
    }
  });

  router.post('/rotate', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForWrite(req as DashboardRequest);
      const rotated = await rotateMerchantApiKey(prisma, merchantDbId);
      res.status(201).json({
        apiKey: rotated.apiKey,
        keyPublicId: rotated.keyPublicId,
        maskedKey: rotated.maskedKey,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
