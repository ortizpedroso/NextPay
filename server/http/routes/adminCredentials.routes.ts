import { Router } from 'express';
import { z } from 'zod';

import { createPaymentGatewayForEnvironment } from '../../gateway/paymentGatewayFactory';
import type { VaultEnvironment } from '../../vault/processorCredentialVault';
import type { PrismaProcessorCredentialRepository } from '../../vault/prismaCredentialRepository';

const environmentParamSchema = z.enum(['SANDBOX', 'PRODUCTION']);

const upsertBodySchema = z
  .object({
    apiAccessToken: z.string().min(16).max(512).optional(),
    webhookToken: z.string().min(8).max(256).optional(),
    walletId: z.string().min(1).max(128).optional(),
  })
  .refine(
    (body) =>
      body.apiAccessToken !== undefined ||
      body.webhookToken !== undefined ||
      body.walletId !== undefined,
    { message: 'Informe ao menos um campo para salvar.' },
  );

function serializeAdminCredentialView(
  environment: VaultEnvironment,
  view: NonNullable<Awaited<ReturnType<PrismaProcessorCredentialRepository['getAdminMaskedView']>>>,
) {
  return {
    environment,
    maskedToken: view.maskedApiToken,
    maskedApiToken: view.maskedApiToken,
    maskedWebhookToken: view.maskedWebhookToken,
    maskedWalletId: view.maskedWalletId,
    configured: view.configuredApi,
    configuredApi: view.configuredApi,
    configuredWebhook: view.configuredWebhook,
    configuredWallet: view.configuredWallet,
    rotationVersion: view.rotationVersion,
  };
}

export type CredentialRepositoryPort = Pick<
  PrismaProcessorCredentialRepository,
  | 'upsertCredential'
  | 'getAdminMaskedView'
  | 'decryptApiToken'
  | 'decryptCredential'
  | 'markValidated'
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

      const masked = await credentialRepository.getAdminMaskedView(environment);
      if (!masked) {
        res.status(404).json({
          error: 'Credencial não configurada para este ambiente.',
          code: 'CREDENTIAL_NOT_FOUND',
          environment,
        });
        return;
      }

      res.json(serializeAdminCredentialView(environment, masked));
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

      const { masked } = await credentialRepository.upsertCredential(environment, body);

      res.status(200).json({
        ...serializeAdminCredentialView(environment, masked),
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
