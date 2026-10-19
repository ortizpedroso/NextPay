import { Router } from 'express';
import { z } from 'zod';

import { createPaymentInputSchema, gatewayEnvironmentSchema } from '../../gateway/dtos';
import type { PaymentGatewayInterface } from '../../gateway/payment-gateway.interface';
import { withIdempotency } from '../../gateway/idempotency';
import type { IdempotencyStore } from '../../gateway/payment-gateway.interface';
import type { VaultEnvironment } from '../../vault/processorCredentialVault';

const createPaymentBodySchema = createPaymentInputSchema.extend({
  environment: gatewayEnvironmentSchema.default('SANDBOX'),
});

export type PaymentGatewayResolver = (
  environment: VaultEnvironment,
) => Promise<PaymentGatewayInterface>;

export function createPaymentsRouter(
  resolveGateway: PaymentGatewayResolver,
  idempotencyStore?: IdempotencyStore,
): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const parsed = createPaymentBodySchema.parse(req.body);
      const { environment, ...paymentInput } = parsed;
      const gateway = await resolveGateway(environment);

      const payment = await withIdempotency(
        idempotencyStore,
        'createPayment',
        paymentInput.idempotencyKey,
        paymentInput,
        86_400_000,
        () => gateway.createPayment(paymentInput),
        (result) => JSON.stringify(result),
        (json) => JSON.parse(json),
      );

      res.status(201).json({ payment });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:paymentId', async (req, res, next) => {
    try {
      const paymentId = z.string().min(1).parse(req.params.paymentId);
      const environment = gatewayEnvironmentSchema.parse(
        (req.query.environment as string | undefined)?.toUpperCase() ?? 'SANDBOX',
      );
      const gateway = await resolveGateway(environment as VaultEnvironment);
      const payment = await gateway.getPayment(paymentId);
      res.json({ payment });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
