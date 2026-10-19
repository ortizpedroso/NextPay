import { Router } from 'express';

import type { OutboundWebhookService } from '../../payments/outboundWebhookService';

export function createJobsRouter(outboundWebhookService: OutboundWebhookService): Router {
  const router = Router();

  router.post('/process-outbound-retries', async (_req, res, next) => {
    try {
      if (!outboundWebhookService.processRetries) {
        res.status(501).json({
          error: 'Retentativas de webhook outbound não suportadas neste ambiente.',
          code: 'NOT_IMPLEMENTED',
        });
        return;
      }

      const result = await outboundWebhookService.processRetries();
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
