import { describe, expect, it } from 'vitest';

import { createPaymentInputSchema, paymentRecordSchema } from './dtos';

describe('Gateway DTO schemas', () => {
  it('valida createPaymentInput com centavos inteiros', () => {
    const parsed = createPaymentInputSchema.parse({
      amountCents: 248,
      method: 'PIX',
      description: 'Consultoria',
      customerId: 'np_cus_abc',
      idempotencyKey: 'idem-12345678',
    });
    expect(parsed.amountCents).toBe(248);
  });

  it('rejeita valores fracionários em centavos', () => {
    expect(() =>
      createPaymentInputSchema.parse({
        amountCents: 10.5,
        method: 'PIX',
        description: 'x',
        customerId: 'np_cus_abc',
        idempotencyKey: 'idem-12345678',
      }),
    ).toThrow();
  });

  it('valida paymentRecord neutro', () => {
    const record = paymentRecordSchema.parse({
      paymentId: 'np_pay_abc',
      status: 'PENDING',
      method: 'PIX',
      amountCents: 1000,
      customerId: 'np_cus_xyz',
      description: 'Item',
      createdAt: new Date().toISOString(),
      pix: {
        qrCodePayload: '00020126PIXTEST00020126',
        copyPasteCode: '00020126PIXTEST00020126',
      },
    });
    expect(record.pix?.copyPasteCode).toContain('PIX');
  });
});
