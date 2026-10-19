import { Router } from 'express';
import { z } from 'zod';

import { gatewayEnvironmentSchema } from '../../gateway/dtos';
import type { PaymentGatewayResolver } from './payments.routes';
import {
  type CheckoutSessionStore,
  newCheckoutPublicId,
} from '../../checkout/checkoutSessionStore';
import {
  confirmHostedCardToken,
  getHostedCardToken,
  issueHostedCardToken,
} from '../../checkout/hostedCardTokens';
import { resolveCheckoutMerchantDbId } from '../../merchant/resolveCheckoutMerchant';
import type { LedgerStore } from '../../payments/ledgerStore';

const createSessionSchema = z.object({
  amountCents: z.number().int().positive(),
  description: z.string().min(1).max(500),
  method: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO']),
  environment: gatewayEnvironmentSchema.default('SANDBOX'),
  paymentLinkPublicId: z.string().max(80).optional(),
  productPublicId: z.string().max(80).optional(),
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

      const merchantId = await resolveCheckoutMerchantDbId({
        paymentLinkPublicId: parsed.paymentLinkPublicId,
        productPublicId: parsed.productPublicId,
      });

      const sessionPublicId = newCheckoutPublicId();
      const session = await checkoutStore.create({
        merchantId,
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
        paymentLinkPublicId: parsed.paymentLinkPublicId ?? null,
        productPublicId: parsed.productPublicId ?? null,
        environment: parsed.environment,
      });

      await ledgerStore.upsert(
        {
          neutralPaymentId: payment.paymentId,
          amountCents: payment.amountCents,
          netAmountCents: payment.netAmountCents,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          customerName: parsed.customer.name,
        },
        merchantId,
      );

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

  router.post('/sessions/:sessionPublicId/hosted-card', async (req, res, next) => {
    try {
      const sessionPublicId = z.string().min(8).parse(req.params.sessionPublicId);
      const session = await checkoutStore.getByPublicId(sessionPublicId);
      if (!session) {
        res.status(404).json({ error: 'Sessão não encontrada.', code: 'NOT_FOUND' });
        return;
      }
      if (session.method !== 'CREDIT_CARD') {
        res.status(400).json({
          error: 'Hosted card disponível apenas para sessões de cartão.',
          code: 'INVALID_METHOD',
        });
        return;
      }

      const hosted = issueHostedCardToken({
        sessionPublicId: session.sessionPublicId,
        amountCents: session.amountCents,
        description: session.description,
      });

      const appOrigin = process.env.APP_URL?.trim() || 'http://localhost:3000';
      res.status(201).json({
        paymentToken: hosted.token,
        redirectUrl: `${appOrigin.replace(/\/+$/, '')}/hosted-card/${hosted.token}`,
        amountCents: hosted.amountCents,
        brandLabel: hosted.brandLabel,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/hosted-card/:token', async (req, res, next) => {
    try {
      const token = z.string().min(8).parse(req.params.token);
      const hosted = getHostedCardToken(token);
      if (!hosted) {
        res.status(404).json({ error: 'Token de cartão inválido.', code: 'NOT_FOUND' });
        return;
      }
      res.json({
        hostedCard: {
          token: hosted.token,
          sessionPublicId: hosted.sessionPublicId,
          amountCents: hosted.amountCents,
          description: hosted.description,
          brandLabel: hosted.brandLabel,
          confirmed: Boolean(hosted.confirmedAt),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  const confirmHostedCardSchema = z.object({
    cardLast4: z.string().regex(/^\d{4}$/),
    cardBrand: z.string().min(2).max(40),
  });

  router.post('/hosted-card/:token/confirm', async (req, res, next) => {
    try {
      const token = z.string().min(8).parse(req.params.token);
      const body = confirmHostedCardSchema.parse(req.body);
      const hosted = confirmHostedCardToken(token, body.cardLast4, body.cardBrand);
      if (!hosted) {
        res.status(404).json({ error: 'Token de cartão inválido.', code: 'NOT_FOUND' });
        return;
      }

      const session = await checkoutStore.getByPublicId(hosted.sessionPublicId);
      if (session?.paymentId) {
        await checkoutStore.updateByPaymentId(session.paymentId, 'PENDING_CARD_CAPTURE');
      }

      res.json({
        ok: true,
        paymentToken: hosted.token,
        cardLast4: hosted.cardLast4,
        status: 'PENDING_CARD_CAPTURE',
        message:
          'Token registrado. Dados completos do cartão permanecem no processador (sem PAN no NextPay).',
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
