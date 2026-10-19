import cors from 'cors';
import express from 'express';

import { prisma } from './db/prisma';
import { InMemoryCheckoutSessionStore, PrismaCheckoutSessionStore } from './checkout/checkoutSessionStore';
import type { CheckoutSessionStore } from './checkout/checkoutSessionStore';
import { createPaymentGatewayForEnvironment } from './gateway/paymentGatewayFactory';
import type { IdempotencyStore } from './gateway/payment-gateway.interface';
import { requireAdminApiToken } from './http/middleware/adminAuth';
import { requireMerchantApiKey } from './http/middleware/merchantAuth';
import { errorHandler } from './http/middleware/errorHandler';
import {
  createAdminCredentialsRouter,
  type CredentialRepositoryPort,
} from './http/routes/adminCredentials.routes';
import { createCustomersRouter, InMemoryMerchantCustomerStore } from './http/routes/customers.routes';
import type { MerchantCustomerStore } from './http/routes/customers.routes';
import { createMerchantRouter } from './http/routes/merchant.routes';
import { createPaymentsRouter, type PaymentGatewayResolver } from './http/routes/payments.routes';
import { createPublicCheckoutRouter } from './http/routes/publicCheckout.routes';
import { createTransactionsRouter } from './http/routes/transactions.routes';
import { createWebhooksRouter } from './http/routes/webhooks.routes';
import { createWithdrawalsRouter } from './http/routes/withdrawals.routes';
import { InMemoryLedgerStore, PrismaLedgerStore } from './payments/ledgerStore';
import type { LedgerStore } from './payments/ledgerStore';
import {
  NoopOutboundWebhookService,
  PrismaOutboundWebhookService,
} from './payments/outboundWebhookService';
import type { OutboundWebhookService } from './payments/outboundWebhookService';
import { PrismaMerchantCustomerStore } from './payments/prismaMerchantCustomerStore';
import { PrismaWebhookEventStore } from './payments/webhookEventStore';
import type { WebhookEventStore } from './payments/webhookEventStore';
import { ProcessorCredentialVaultService } from './vault/processorCredentialVault';
import { PrismaProcessorCredentialRepository } from './vault/prismaCredentialRepository';

export type CreateAppOptions = {
  credentialRepository?: CredentialRepositoryPort;
  resolvePaymentGateway?: PaymentGatewayResolver;
  webhookEventStore?: WebhookEventStore;
  idempotencyStore?: IdempotencyStore;
  checkoutSessionStore?: CheckoutSessionStore;
  ledgerStore?: LedgerStore;
  merchantCustomerStore?: MerchantCustomerStore;
  outboundWebhookService?: OutboundWebhookService;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.disable('x-powered-by');

  const appOrigin = process.env.APP_URL?.trim() || 'http://localhost:3000';
  app.use(
    cors({
      origin: appOrigin,
      methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-NextPay-Webhook-Token',
        'X-NextPay-Merchant-Key',
      ],
    }),
  );

  app.use(express.json({ limit: '256kb' }));

  const credentialRepository =
    options.credentialRepository ??
    new PrismaProcessorCredentialRepository(
      prisma,
      ProcessorCredentialVaultService.fromEnvironment(),
    );

  const resolvePaymentGateway: PaymentGatewayResolver =
    options.resolvePaymentGateway ??
    (async (environment) => createPaymentGatewayForEnvironment(environment, credentialRepository));

  const webhookEventStore =
    options.webhookEventStore ?? new PrismaWebhookEventStore(prisma);

  const checkoutSessionStore =
    options.checkoutSessionStore ?? new PrismaCheckoutSessionStore(prisma);

  const ledgerStore = options.ledgerStore ?? new PrismaLedgerStore(prisma);

  const merchantCustomerStore =
    options.merchantCustomerStore ?? new PrismaMerchantCustomerStore(prisma);

  const outboundWebhookService =
    options.outboundWebhookService ?? new PrismaOutboundWebhookService(prisma);

  const idempotencyStore = options.idempotencyStore;

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'nextpay-api',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    '/api/v1/public/checkout',
    createPublicCheckoutRouter(resolvePaymentGateway, checkoutSessionStore, ledgerStore),
  );

  app.use(
    '/api/v1/admin/credentials',
    requireAdminApiToken,
    createAdminCredentialsRouter(credentialRepository),
  );

  app.use(
    '/api/v1/payments',
    requireAdminApiToken,
    createPaymentsRouter(resolvePaymentGateway, idempotencyStore),
  );

  app.use(
    '/api/v1/customers',
    requireAdminApiToken,
    createCustomersRouter(resolvePaymentGateway, merchantCustomerStore),
  );

  app.use(
    '/api/v1/transactions',
    requireAdminApiToken,
    createTransactionsRouter(ledgerStore),
  );

  app.use(
    '/api/v1/withdrawals',
    requireAdminApiToken,
    createWithdrawalsRouter(),
  );

  app.use(
    '/api/v1/merchant',
    requireMerchantApiKey,
    createMerchantRouter(),
  );

  app.use(
    '/api/v1/webhooks',
    createWebhooksRouter(
      resolvePaymentGateway,
      webhookEventStore,
      'SANDBOX',
      checkoutSessionStore,
      ledgerStore,
      outboundWebhookService,
    ),
  );

  app.use(errorHandler);

  return app;
}

// exported for tests defaults
export { InMemoryCheckoutSessionStore, InMemoryLedgerStore, InMemoryMerchantCustomerStore, NoopOutboundWebhookService };
