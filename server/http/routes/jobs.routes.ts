import { Router } from 'express';

import type { OutboundWebhookService } from '../../payments/outboundWebhookService';
import { processDueSubscriptionRenewals } from '../../subscriptions/subscriptionRenewal';
import type { SubscriptionStore } from '../../subscriptions/subscriptionStore';
import type { PaymentGatewayResolver } from './payments.routes';

export function createJobsRouter(
  outboundWebhookService: OutboundWebhookService,
  subscriptionStore?: SubscriptionStore,
  resolveGateway?: PaymentGatewayResolver,
): Router {
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

  router.post('/process-subscription-renewals', async (_req, res, next) => {
    try {
      if (!subscriptionStore || !resolveGateway) {
        res.status(503).json({
          error: 'Renovação de assinaturas indisponível.',
          code: 'RENEWAL_DISABLED',
        });
        return;
      }
      const result = await processDueSubscriptionRenewals(subscriptionStore, resolveGateway);
      res.json({ ok: true, ...result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
