import cors from 'cors';
import express from 'express';

import { prisma } from './db/prisma';
import {
  InMemoryCheckoutSessionStore,
  PrismaCheckoutSessionStore,
} from './checkout/checkoutSessionStore';
import type { CheckoutSessionStore } from './checkout/checkoutSessionStore';
import { createPaymentGatewayForEnvironment } from './gateway/paymentGatewayFactory';
import type { IdempotencyStore } from './gateway/payment-gateway.interface';
import { requireAdminApiToken } from './http/middleware/adminAuth';
import { requireInternalOrAdminToken } from './http/middleware/internalOrAdminAuth';
import { requireSandboxEnvironment } from './http/middleware/sandboxOnly';
import { requireDashboardAuth } from './http/middleware/dashboardAuth';
import { requireMerchantApiKey } from './http/middleware/merchantAuth';
import { errorHandler } from './http/middleware/errorHandler';
import {
  createAdminCredentialsRouter,
  type CredentialRepositoryPort,
} from './http/routes/adminCredentials.routes';
import {
  createCustomersRouter,
  InMemoryMerchantCustomerStore,
} from './http/routes/customers.routes';
import type { MerchantCustomerStore } from './http/routes/customers.routes';
import { PrismaCatalogProductStore, PrismaPaymentLinkStore } from './catalog/prismaCatalogStores';
import { createMerchantRouter } from './http/routes/merchant.routes';
import {
  createPaymentLinksRouter,
  InMemoryPaymentLinkStore,
} from './http/routes/paymentLinks.routes';
import type { PaymentLinkStore } from './http/routes/paymentLinks.routes';
import { createProductsRouter, InMemoryCatalogProductStore } from './http/routes/products.routes';
import type { CatalogProductStore } from './http/routes/products.routes';
import { createPaymentsRouter, type PaymentGatewayResolver } from './http/routes/payments.routes';
import { createAdminDashboardRouter } from './http/routes/adminDashboard.routes';
import { createAdminMerchantsRouter } from './http/routes/adminMerchants.routes';
import { createMerchantAuthRouter } from './http/routes/merchantAuth.routes';
import { createPublicCheckoutRouter } from './http/routes/publicCheckout.routes';
import { createPublicPaymentLinksRouter } from './http/routes/publicPaymentLinks.routes';
import { createTransactionsRouter } from './http/routes/transactions.routes';
import { createWebhooksRouter } from './http/routes/webhooks.routes';
import { createWithdrawalsRouter } from './http/routes/withdrawals.routes';
import { createSubscriptionsRouter } from './http/routes/subscriptions.routes';
import {
  InMemorySubscriptionStore,
  PrismaSubscriptionStore,
} from './subscriptions/subscriptionStore';
import type { SubscriptionStore } from './subscriptions/subscriptionStore';
import { createMerchantApiKeysRouter } from './http/routes/merchantApiKeys.routes';
import { createMerchantIntegrationsRouter } from './http/routes/merchantIntegrations.routes';
import { createJobsRouter } from './http/routes/jobs.routes';
import { createSandboxRouter } from './http/routes/sandbox.routes';
import { InMemoryLedgerStore, PrismaLedgerStore } from './payments/ledgerStore';
import type { LedgerStore } from './payments/ledgerStore';
import {
  InMemoryOutboundWebhookService,
  NoopOutboundWebhookService,
  PrismaOutboundWebhookService,
} from './payments/outboundWebhookService';
import type { OutboundWebhookService } from './payments/outboundWebhookService';
import { PrismaMerchantCustomerStore } from './payments/prismaMerchantCustomerStore';
import { PrismaWebhookEventStore } from './payments/webhookEventStore';
import type { WebhookEventStore } from './payments/webhookEventStore';
import { resolveDefaultGatewayEnvironment } from './config/gatewayEnvironment';
import { PrismaIdempotencyStore } from './payments/prismaIdempotencyStore';
import { FixtureCredentialRepository } from './vault/fixtureCredentialRepository';
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
  catalogProductStore?: CatalogProductStore;
  paymentLinkStore?: PaymentLinkStore;
  subscriptionStore?: SubscriptionStore;
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

  const credentialRepository = options.credentialRepository ?? buildDefaultCredentialRepository();

  const resolvePaymentGateway: PaymentGatewayResolver =
    options.resolvePaymentGateway ??
    (async (environment) => createPaymentGatewayForEnvironment(environment, credentialRepository));

  const webhookEventStore = options.webhookEventStore ?? new PrismaWebhookEventStore(prisma);

  const checkoutSessionStore =
    options.checkoutSessionStore ?? new PrismaCheckoutSessionStore(prisma);

  const ledgerStore = options.ledgerStore ?? new PrismaLedgerStore(prisma);

  const merchantCustomerStore =
    options.merchantCustomerStore ?? new PrismaMerchantCustomerStore(prisma);

  const outboundWebhookService =
    options.outboundWebhookService ?? new PrismaOutboundWebhookService(prisma);

  const catalogProductStore = options.catalogProductStore ?? new PrismaCatalogProductStore(prisma);

  const paymentLinkStore = options.paymentLinkStore ?? new PrismaPaymentLinkStore(prisma);

  const subscriptionStore = options.subscriptionStore ?? new PrismaSubscriptionStore(prisma);

  const idempotencyStore = options.idempotencyStore ?? new PrismaIdempotencyStore(prisma);

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

  app.use('/api/v1/public', createPublicPaymentLinksRouter(paymentLinkStore, catalogProductStore));

  app.use('/api/v1/merchant/auth', createMerchantAuthRouter());

  app.use(
    '/api/v1/admin/credentials',
    requireAdminApiToken,
    createAdminCredentialsRouter(credentialRepository),
  );

  app.use('/api/v1/admin/merchants', requireAdminApiToken, createAdminMerchantsRouter());

  app.use(
    '/api/v1/payments',
    requireDashboardAuth,
    createPaymentsRouter(resolvePaymentGateway, idempotencyStore),
  );

  app.use(
    '/api/v1/customers',
    requireDashboardAuth,
    createCustomersRouter(resolvePaymentGateway, merchantCustomerStore),
  );

  app.use('/api/v1/transactions', requireDashboardAuth, createTransactionsRouter(ledgerStore));

  app.use('/api/v1/withdrawals', requireDashboardAuth, createWithdrawalsRouter());

  app.use('/api/v1/products', requireDashboardAuth, createProductsRouter(catalogProductStore));

  app.use(
    '/api/v1/payment-links',
    requireDashboardAuth,
    createPaymentLinksRouter(paymentLinkStore),
  );

  app.use('/api/v1/admin/dashboard', requireDashboardAuth, createAdminDashboardRouter(prisma));

  app.use(
    '/api/v1/subscriptions',
    requireDashboardAuth,
    createSubscriptionsRouter(subscriptionStore, resolvePaymentGateway),
  );

  app.use('/api/v1/merchant/api-keys', requireDashboardAuth, createMerchantApiKeysRouter());

  app.use(
    '/api/v1/merchant/integrations',
    requireDashboardAuth,
    createMerchantIntegrationsRouter(),
  );

  app.use(
    '/api/v1/merchant',
    requireMerchantApiKey,
    createMerchantRouter(catalogProductStore, paymentLinkStore),
  );

  app.use('/api/v1/jobs', requireInternalOrAdminToken, createJobsRouter(outboundWebhookService));

  app.use(
    '/api/v1/sandbox',
    requireDashboardAuth,
    requireSandboxEnvironment,
    createSandboxRouter(ledgerStore),
  );

  const webhookGatewayEnvironment = resolveDefaultGatewayEnvironment();

  app.use(
    '/api/v1/webhooks',
    createWebhooksRouter(
      resolvePaymentGateway,
      webhookEventStore,
      webhookGatewayEnvironment,
      checkoutSessionStore,
      ledgerStore,
      outboundWebhookService,
      paymentLinkStore,
      catalogProductStore,
    ),
  );

  app.use(errorHandler);

  return app;
}

function buildDefaultCredentialRepository(): CredentialRepositoryPort {
  const mode = process.env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
  if (mode === 'fixture' || mode === 'in_memory') {
    return new FixtureCredentialRepository();
  }
  return new PrismaProcessorCredentialRepository(
    prisma,
    ProcessorCredentialVaultService.fromEnvironment(),
  );
}

// exported for tests defaults
export {
  InMemoryCatalogProductStore,
  InMemoryCheckoutSessionStore,
  InMemoryLedgerStore,
  InMemoryMerchantCustomerStore,
  InMemoryPaymentLinkStore,
  InMemoryOutboundWebhookService,
  NoopOutboundWebhookService,
  InMemorySubscriptionStore,
};
