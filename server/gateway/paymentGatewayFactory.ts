import { prisma } from '../db/prisma';
import { PrismaCorrelationStore } from '../payments/correlationStore';
import type { CorrelationStore } from '../payments/correlationStore';
import type { VaultEnvironment } from '../vault/processorCredentialVault';
import type { PrismaProcessorCredentialRepository } from '../vault/prismaCredentialRepository';
import { PrimaryProcessorGatewayAdapter } from './adapters/primary-processor-gateway.adapter';
import type { PaymentGatewayInterface } from './payment-gateway.interface';

export async function createPaymentGatewayForEnvironment(
  environment: VaultEnvironment,
  credentialRepository: Pick<PrismaProcessorCredentialRepository, 'decryptApiToken'>,
  correlationStore: CorrelationStore = new PrismaCorrelationStore(prisma),
): Promise<PaymentGatewayInterface> {
  const accessToken = await credentialRepository.decryptApiToken(environment);
  return PrimaryProcessorGatewayAdapter.create(environment, accessToken, correlationStore);
}
