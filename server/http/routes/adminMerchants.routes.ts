import { Router } from 'express';
import { z } from 'zod';

import { onboardMerchant } from '../../merchant/onboardMerchant';

const createMerchantSchema = z.object({
  displayName: z.string().min(2).max(200),
  ownerEmail: z.string().email().max(180).optional(),
  createSandboxVaultPlaceholder: z.boolean().optional().default(false),
});

export function createAdminMerchantsRouter(): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const body = createMerchantSchema.parse(req.body);
      const result = await onboardMerchant(body);
      res.status(201).json({ merchant: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
