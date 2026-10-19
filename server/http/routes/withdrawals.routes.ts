import { Router } from 'express';
import { z } from 'zod';

const withdrawalSchema = z.object({
  amountCents: z.number().int().positive(),
  pixKey: z.string().min(5).max(180),
});

export function createWithdrawalsRouter(): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const body = withdrawalSchema.parse(req.body);
      res.status(202).json({
        status: 'QUEUED',
        protocol: `wd_${Date.now()}`,
        amountCents: body.amountCents,
        message: 'Saque enfileirado para liquidação Pix D+0.',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
