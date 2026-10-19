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

export type CreateAppOptions = {
  credentialRepository?: CredentialRepositoryPort;
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

  app.use(errorHandler);

  return app;
}
