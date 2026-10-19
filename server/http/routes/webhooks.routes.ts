import { Router } from 'express';

import type { PaymentGatewayInterface } from '../../gateway/payment-gateway.interface';
import type { VaultEnvironment } from '../../vault/processorCredentialVault';
import type { WebhookEventStore } from '../../payments/webhookEventStore';
import type { CheckoutSessionStore } from '../../checkout/checkoutSessionStore';
import type { LedgerStore } from '../../payments/ledgerStore';
import type { OutboundWebhookService } from '../../payments/outboundWebhookService';
import type { PaymentGatewayResolver } from './payments.routes';

export function createWebhooksRouter(
  resolveGateway: PaymentGatewayResolver,
  webhookEventStore: WebhookEventStore,
  defaultEnvironment: VaultEnvironment = 'SANDBOX',
  checkoutStore?: CheckoutSessionStore,
  ledgerStore?: LedgerStore,
  outboundWebhookService?: OutboundWebhookService,
): Router {
  const router = Router();

  router.post('/inbound', async (req, res, next) => {
    try {
      const configuredSecret = process.env.WEBHOOK_INBOUND_SECRET?.trim();
      if (!configuredSecret) {
        res.status(503).json({ error: 'Webhook inbound não configurado.', code: 'WEBHOOK_DISABLED' });
        return;
      }

      const provided = req.header('x-nextpay-webhook-token')?.trim();
      if (!provided || provided !== configuredSecret) {
        res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
        return;
      }

      const gateway: PaymentGatewayInterface = await resolveGateway(defaultEnvironment);
      const normalized = gateway.parseIncomingWebhook({
        headers: Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.join(',') : String(value ?? ''),
          ]),
        ),
        body: req.body,
      });

      if (await webhookEventStore.hasProcessed(normalized.rawFingerprint)) {
        res.status(200).json({
          status: 'duplicate_ignored',
          eventId: normalized.eventId,
          eventType: normalized.eventType,
        });
        return;
      }

      await webhookEventStore.markProcessed({
        fingerprint: normalized.rawFingerprint,
        eventType: normalized.eventType,
        payloadJson: JSON.stringify(req.body),
      });

      if (normalized.paymentId && normalized.status) {
        await checkoutStore?.updateByPaymentId(normalized.paymentId, normalized.status);
        await ledgerStore?.upsert({
          neutralPaymentId: normalized.paymentId,
          amountCents: normalized.amountCents ?? 0,
          status: normalized.status,
          method: 'PIX',
          description: 'Atualização via webhook inbound',
        });
      }

      await outboundWebhookService?.dispatch(normalized.eventType, normalized);

      res.status(200).json({
        status: 'processed',
        event: normalized,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
