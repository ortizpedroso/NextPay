import { prisma } from '../db/prisma';
import { PrismaCorrelationStore } from '../payments/correlationStore';
import type { CorrelationStore } from '../payments/correlationStore';
import type { VaultEnvironment } from '../vault/processorCredentialVault';
import type { PrismaProcessorCredentialRepository } from '../vault/prismaCredentialRepository';
import { InMemoryPaymentGateway } from './adapters/in-memory-gateway.adapter';
import { PrimaryProcessorGatewayAdapter } from './adapters/primary-processor-gateway.adapter';
import type { PaymentGatewayInterface } from './payment-gateway.interface';

export async function createPaymentGatewayForEnvironment(
  environment: VaultEnvironment,
  credentialRepository: Pick<
    PrismaProcessorCredentialRepository,
    'decryptApiToken' | 'decryptCredential'
  >,
  correlationStore: CorrelationStore = new PrismaCorrelationStore(prisma),
): Promise<PaymentGatewayInterface> {
  const mode = process.env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
  if (mode === 'fixture' || mode === 'in_memory') {
    return new InMemoryPaymentGateway(environment);
  }

  const accessToken = await credentialRepository.decryptApiToken(environment);
  if (accessToken.startsWith('np_sec_test_')) {
    return new InMemoryPaymentGateway(environment);
  }

  const credential = await credentialRepository.decryptCredential(environment);
  const splitWalletId = credential?.walletId?.trim() || process.env.NEXTPAY_WALLET_ID?.trim();

  return PrimaryProcessorGatewayAdapter.create(
    environment,
    accessToken,
    correlationStore,
    splitWalletId,
  );
}
