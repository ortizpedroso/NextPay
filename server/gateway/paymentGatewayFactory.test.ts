import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryPaymentGateway } from './adapters/in-memory-gateway.adapter';
import { PrimaryProcessorGatewayAdapter } from './adapters/primary-processor-gateway.adapter';
import { createPaymentGatewayForEnvironment } from './paymentGatewayFactory';

describe('createPaymentGatewayForEnvironment', () => {
  beforeEach(() => {
    delete process.env.PAYMENT_GATEWAY_MODE;
  });

  it('usa adaptador em memória no modo fixture', async () => {
    process.env.PAYMENT_GATEWAY_MODE = 'fixture';
    const gateway = await createPaymentGatewayForEnvironment('SANDBOX', {
      decryptApiToken: vi.fn(async () => 'np_sec_live_real_key_0123456789ab'),
      decryptCredential: vi.fn(async () => null),
    });
    expect(gateway).toBeInstanceOf(InMemoryPaymentGateway);
  });

  it('usa adaptador em memória para tokens np_sec_test_', async () => {
    const gateway = await createPaymentGatewayForEnvironment('SANDBOX', {
      decryptApiToken: vi.fn(async () => 'np_sec_test_0123456789abcdef0123456789ab'),
      decryptCredential: vi.fn(async () => null),
    });
    expect(gateway).toBeInstanceOf(InMemoryPaymentGateway);
  });

  it('instancia adaptador primário para tokens reais', async () => {
    const gateway = await createPaymentGatewayForEnvironment('SANDBOX', {
      decryptApiToken: vi.fn(async () => 'np_sec_sandbox_0123456789abcdef0123456789ab'),
      decryptCredential: vi.fn(async () => null),
    });
    expect(gateway).toBeInstanceOf(PrimaryProcessorGatewayAdapter);
  });
});
