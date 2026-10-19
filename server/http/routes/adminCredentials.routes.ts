import { Router } from 'express';
import { z } from 'zod';

import { createPaymentGatewayForEnvironment } from '../../gateway/paymentGatewayFactory';
import type { VaultEnvironment } from '../../vault/processorCredentialVault';
import type { PrismaProcessorCredentialRepository } from '../../vault/prismaCredentialRepository';

const environmentParamSchema = z.enum(['SANDBOX', 'PRODUCTION']);

const upsertBodySchema = z.object({
  apiAccessToken: z.string().min(16).max(512),
});

export type CredentialRepositoryPort = Pick<
  PrismaProcessorCredentialRepository,
  'upsertCredential' | 'getMasked' | 'decryptApiToken' | 'markValidated'
>;

export function createAdminCredentialsRouter(
  credentialRepository: CredentialRepositoryPort,
): Router {
  const router = Router();

  router.get('/:environment', async (req, res, next) => {
    try {
      const environment = environmentParamSchema.parse(
        req.params.environment?.toUpperCase(),
      ) as VaultEnvironment;

      const masked = await credentialRepository.getMasked(environment);
      if (!masked) {
        res.status(404).json({
          error: 'Credencial não configurada para este ambiente.',
          code: 'CREDENTIAL_NOT_FOUND',
          environment,
        });
        return;
      }

      res.json({
        environment,
        maskedToken: masked.maskedDisplay,
        rotationVersion: masked.rotationVersion,
        configured: true,
      });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:environment', async (req, res, next) => {
    try {
      const environment = environmentParamSchema.parse(
        req.params.environment?.toUpperCase(),
      ) as VaultEnvironment;
      const body = upsertBodySchema.parse(req.body);

      const stored = await credentialRepository.upsertCredential(environment, body.apiAccessToken);

      res.status(200).json({
        environment,
        maskedToken: stored.maskedDisplay,
        rotationVersion: stored.rotationVersion,
        configured: true,
        message: 'Credencial armazenada com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:environment/test', async (req, res, next) => {
    try {
      const environment = environmentParamSchema.parse(
        req.params.environment?.toUpperCase(),
      ) as VaultEnvironment;

      const gateway = await createPaymentGatewayForEnvironment(environment, credentialRepository);
      const result = await gateway.testConnectivity();

      if (result.ok) {
        await credentialRepository.markValidated(environment);
      }

      res.json({
        environment,
        ok: result.ok,
        latencyMs: result.latencyMs,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
