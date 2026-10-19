import { Router } from 'express';
import { z } from 'zod';

import type { DashboardRequest } from '../../merchant/merchantScope';
import {
  resolveMerchantDbIdForRead,
  resolveMerchantDbIdForWrite,
} from '../../merchant/merchantScope';
import type { SubscriptionStore } from '../../subscriptions/subscriptionStore';
import type { PaymentGatewayResolver } from './payments.routes';

const createSubscriptionSchema = z.object({
  productPublicId: z.string().max(80).optional(),
  planTitle: z.string().min(1).max(200),
  priceCents: z.number().int().positive(),
  cadenceLabel: z.string().min(1).max(128),
  customerName: z.string().min(1).max(140),
  customerEmail: z.string().email().max(180),
  paymentMethod: z.string().min(1).max(64),
  nextBillingAt: z.string().datetime().optional(),
});

const updateSubscriptionSchema = z.object({
  paymentMethod: z.string().min(1).max(64).optional(),
  status: z.enum(['ACTIVE', 'OVERDUE', 'CANCELED']).optional(),
  nextBillingAt: z.string().datetime().optional(),
});

export function createSubscriptionsRouter(
  subscriptionStore: SubscriptionStore,
  _resolveGateway?: PaymentGatewayResolver,
): Router {
  const router = Router();

  router.get('/metrics', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const metrics = await subscriptionStore.metrics(merchantDbId);
      res.json({ metrics });
    } catch (error) {
      next(error);
    }
  });

  router.get('/plans', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const plans = await subscriptionStore.listPlanSummaries(merchantDbId);
      res.json({ plans });
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const subscriptions = await subscriptionStore.list(merchantDbId);
      res.json({ subscriptions });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:subscriptionPublicId', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const subscription = await subscriptionStore.getByPublicId(
        req.params.subscriptionPublicId,
        merchantDbId,
      );
      if (!subscription) {
        res.status(404).json({ error: 'Assinatura não encontrada.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = createSubscriptionSchema.parse(req.body);
      const merchantDbId = await resolveMerchantDbIdForWrite(req as DashboardRequest);
      const nextBillingAt = body.nextBillingAt
        ? new Date(body.nextBillingAt)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const subscription = await subscriptionStore.create(
        {
          productPublicId: body.productPublicId ?? null,
          planTitle: body.planTitle.trim(),
          priceCents: body.priceCents,
          cadenceLabel: body.cadenceLabel.trim(),
          customerName: body.customerName.trim(),
          customerEmail: body.customerEmail.trim(),
          paymentMethod: body.paymentMethod.trim(),
          nextBillingAt,
        },
        merchantDbId,
      );

      res.status(201).json({ subscription });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:subscriptionPublicId', async (req, res, next) => {
    try {
      const body = updateSubscriptionSchema.parse(req.body);
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const subscription = await subscriptionStore.update(
        req.params.subscriptionPublicId,
        {
          ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(body.nextBillingAt ? { nextBillingAt: new Date(body.nextBillingAt) } : {}),
        },
        merchantDbId,
      );
      if (!subscription) {
        res.status(404).json({ error: 'Assinatura não encontrada.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:subscriptionPublicId', async (req, res, next) => {
    try {
      const merchantDbId = await resolveMerchantDbIdForRead(req as DashboardRequest);
      const subscription = await subscriptionStore.cancel(
        req.params.subscriptionPublicId,
        merchantDbId,
      );
      if (!subscription) {
        res.status(404).json({ error: 'Assinatura não encontrada.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ subscription });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
