import { Router } from 'express';
import { z } from 'zod';

import { gatewayEnvironmentSchema } from '../../gateway/dtos';
import type { PaymentGatewayResolver } from './payments.routes';
import {
  type CheckoutSessionStore,
  newCheckoutPublicId,
} from '../../checkout/checkoutSessionStore';
import type { LedgerStore } from '../../payments/ledgerStore';

const createSessionSchema = z.object({
  amountCents: z.number().int().positive(),
  description: z.string().min(1).max(500),
  method: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']),
  environment: gatewayEnvironmentSchema.default('SANDBOX'),
  customer: z.object({
    name: z.string().min(2).max(140),
    email: z.string().email(),
    document: z.string().min(11).max(18),
  }),
});

export function createPublicCheckoutRouter(
  resolveGateway: PaymentGatewayResolver,
  checkoutStore: CheckoutSessionStore,
  ledgerStore: LedgerStore,
): Router {
  const router = Router();

  router.post('/sessions', async (req, res, next) => {
    try {
      const parsed = createSessionSchema.parse(req.body);
      const gateway = await resolveGateway(parsed.environment);

      const customer = await gateway.createCustomer({
        name: parsed.customer.name,
        email: parsed.customer.email,
        document: parsed.customer.document,
      });

      const payment = await gateway.createPayment({
        amountCents: parsed.amountCents,
        method: parsed.method,
        description: parsed.description,
        customerId: customer.customerId,
        idempotencyKey: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });

      const sessionPublicId = newCheckoutPublicId();
      const session = await checkoutStore.create({
        sessionPublicId,
        amountCents: parsed.amountCents,
        description: parsed.description,
        method: parsed.method,
        status: payment.status,
        paymentId: payment.paymentId,
        pixCopyPaste: payment.pix?.copyPasteCode ?? null,
        customerName: parsed.customer.name,
        customerEmail: parsed.customer.email,
        customerDocument: parsed.customer.document,
        environment: parsed.environment,
      });

      await ledgerStore.upsert({
        neutralPaymentId: payment.paymentId,
        amountCents: payment.amountCents,
        netAmountCents: payment.netAmountCents,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        customerName: parsed.customer.name,
      });

      res.status(201).json({
        session: {
          sessionPublicId: session.sessionPublicId,
          status: session.status,
          paymentId: session.paymentId,
          pixCopyPaste: session.pixCopyPaste,
          amountCents: session.amountCents,
          method: session.method,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/sessions/:sessionPublicId', async (req, res, next) => {
    try {
      const sessionPublicId = z.string().min(8).parse(req.params.sessionPublicId);
      const session = await checkoutStore.getByPublicId(sessionPublicId);
      if (!session) {
        res.status(404).json({ error: 'Sessão não encontrada.', code: 'NOT_FOUND' });
        return;
      }

      res.json({
        session: {
          sessionPublicId: session.sessionPublicId,
          status: session.status,
          paymentId: session.paymentId,
          pixCopyPaste: session.pixCopyPaste,
          amountCents: session.amountCents,
          method: session.method,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
