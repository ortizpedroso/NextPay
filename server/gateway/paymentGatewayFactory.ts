import { PrimaryProcessorGatewayAdapter } from './adapters/primary-processor-gateway.adapter';
import type { PaymentGatewayInterface } from './payment-gateway.interface';
import type { VaultEnvironment } from '../vault/processorCredentialVault';
import type { PrismaProcessorCredentialRepository } from '../vault/prismaCredentialRepository';

export async function createPaymentGatewayForEnvironment(
  environment: VaultEnvironment,
  credentialRepository: Pick<PrismaProcessorCredentialRepository, 'decryptApiToken'>,
): Promise<PaymentGatewayInterface> {
  const accessToken = await credentialRepository.decryptApiToken(environment);
  return PrimaryProcessorGatewayAdapter.create(environment, accessToken);
}
