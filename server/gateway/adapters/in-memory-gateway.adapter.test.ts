import { describe, expect, it } from 'vitest';

import { InMemoryPaymentGateway } from './in-memory-gateway.adapter';

describe('InMemoryPaymentGateway', () => {
  it('cria pagamento PIX com QR e copia-e-cola', async () => {
    const gw = new InMemoryPaymentGateway('SANDBOX');
    const customer = await gw.createCustomer({
      name: 'Ana',
      email: 'ana@example.com',
      document: '39053344705',
    });

    const payment = await gw.createPayment({
      amountCents: 150000,
      method: 'PIX',
      description: 'Consultoria',
      customerId: customer.customerId,
      idempotencyKey: 'idem-12345678',
    });

    expect(payment.status).toBe('PENDING');
    expect(payment.pix?.copyPasteCode).toBeTruthy();
  });

  it('normaliza webhook sem termos externos', () => {
    const gw = new InMemoryPaymentGateway();
    const event = gw.parseIncomingWebhook({
      headers: { 'content-type': 'application/json' },
      body: { event: 'PAYMENT_RECEIVED', payment: { id: 'ext-1', value: 10 } },
    });

    expect(event.eventType).toBe('PAYMENT_RECEIVED');
    expect(event.paymentId).toMatch(/^np_pay_/);
  });
});
