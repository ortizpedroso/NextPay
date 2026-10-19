import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PrimaryProcessorGatewayAdapter } from '../gateway/adapters/primary-processor-gateway.adapter';
import { ProcessorPrimaryHttpClient } from '../infra/processor-primary/internal-http.client';
import { startMockProcessorHttpServer } from './mockProcessorHttpServer';

describe('mockProcessorHttpServer + adaptador primário', () => {
  let closeMock: (() => Promise<void>) | null = null;

  beforeEach(() => {
    process.env.NEXTPAY_WALLET_ID = 'wallet-nextpay-root';
    process.env.NEXTPAY_SPLIT_PERCENT = '1.5';
  });

  afterEach(async () => {
    if (closeMock) {
      await closeMock();
      closeMock = null;
    }
    delete process.env.NEXTPAY_WALLET_ID;
    delete process.env.NEXTPAY_SPLIT_PERCENT;
  });

  it('cria pagamento Pix via HTTP mockado', async () => {
    const mock = await startMockProcessorHttpServer();
    closeMock = mock.close;

    const http = new ProcessorPrimaryHttpClient({
      baseUrl: mock.baseUrl,
      accessToken: 'np_sec_sandbox_0123456789abcdef0123456789ab',
      timeoutMs: 5_000,
    });
    const gateway = new PrimaryProcessorGatewayAdapter('SANDBOX', http);

    const customer = await gateway.createCustomer({
      name: 'Cliente Mock',
      email: 'mock@nextpay.test',
      document: '39053344705',
    });

    const payment = await gateway.createPayment({
      amountCents: 9900,
      method: 'PIX',
      description: 'Teste integração mock',
      customerId: customer.customerId,
      idempotencyKey: 'idem-mock-12345678',
      splitWalletId: 'wallet-nextpay-root',
    });

    expect(payment.paymentId).toMatch(/^np_pay_/);
    expect(payment.amountCents).toBe(9900);
    expect(payment.status).toBeTruthy();
  });

  it('ping de conectividade responde ok', async () => {
    const mock = await startMockProcessorHttpServer();
    closeMock = mock.close;

    const http = new ProcessorPrimaryHttpClient({
      baseUrl: mock.baseUrl,
      accessToken: 'np_sec_sandbox_0123456789abcdef0123456789ab',
      timeoutMs: 5_000,
    });
    const gateway = new PrimaryProcessorGatewayAdapter('SANDBOX', http);
    const result = await gateway.testConnectivity();
    expect(result.ok).toBe(true);
  });
});
