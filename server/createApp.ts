import cors from 'cors';
import express from 'express';

import { ProcessorCredentialVaultService } from './vault/processorCredentialVault';
import { PrismaProcessorCredentialRepository } from './vault/prismaCredentialRepository';
import { prisma } from './db/prisma';
import { errorHandler } from './http/middleware/errorHandler';
import { requireAdminApiToken } from './http/middleware/adminAuth';
import {
  createAdminCredentialsRouter,
  type CredentialRepositoryPort,
} from './http/routes/adminCredentials.routes';
import { createPaymentsRouter, type PaymentGatewayResolver } from './http/routes/payments.routes';
import { createWebhooksRouter } from './http/routes/webhooks.routes';
import { createPaymentGatewayForEnvironment } from './gateway/paymentGatewayFactory';
import type { WebhookEventStore } from './payments/webhookEventStore';
import { PrismaWebhookEventStore } from './payments/webhookEventStore';
import type { IdempotencyStore } from './gateway/payment-gateway.interface';
export type CreateAppOptions = {
  credentialRepository?: CredentialRepositoryPort;
  resolvePaymentGateway?: PaymentGatewayResolver;
  webhookEventStore?: WebhookEventStore;
  idempotencyStore?: IdempotencyStore;
};

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.disable('x-powered-by');

  const appOrigin = process.env.APP_URL?.trim() || 'http://localhost:3000';
  app.use(
    cors({
      origin: appOrigin,
      methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
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

  const idempotencyStore = options.idempotencyStore;

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'nextpay-api',
      timestamp: new Date().toISOString(),
    });
  });

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

  app.use('/api/v1/webhooks', createWebhooksRouter(resolvePaymentGateway, webhookEventStore));

  app.use(errorHandler);

  return app;
}
