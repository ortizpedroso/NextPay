import { z } from 'zod';

export const paymentMethodSchema = z.enum(['PIX', 'CREDIT_CARD', 'BOLETO', 'DEBIT_CARD']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'RECEIVED',
  'OVERDUE',
  'REFUNDED',
  'CANCELLED',
  'FAILED',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const gatewayEnvironmentSchema = z.enum(['SANDBOX', 'PRODUCTION']);
export type GatewayEnvironmentDto = z.infer<typeof gatewayEnvironmentSchema>;

export const createCustomerInputSchema = z.object({
  name: z.string().min(2).max(140),
  email: z.string().email().max(180),
  document: z.string().min(11).max(18),
  phone: z.string().min(10).max(20).optional(),
  externalReference: z.string().max(64).optional(),
});
export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;

export const createPaymentInputSchema = z.object({
  amountCents: z.number().int().positive().max(999_999_999_99),
  method: paymentMethodSchema,
  description: z.string().min(1).max(500),
  customerId: z.string().min(1).max(64),
  dueDate: z.string().datetime().optional(),
  idempotencyKey: z.string().min(8).max(128),
  installmentCount: z.number().int().min(1).max(21).optional(),
  externalReference: z.string().max(64).optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

export const pixPaymentDetailsSchema = z.object({
  qrCodePayload: z.string().min(10),
  copyPasteCode: z.string().min(10),
  expiresAt: z.string().datetime().optional(),
});
export type PixPaymentDetails = z.infer<typeof pixPaymentDetailsSchema>;

export const boletoPaymentDetailsSchema = z.object({
  digitableLine: z.string().min(10),
  pdfUrl: z.string().url().optional(),
  dueDate: z.string().datetime(),
});
export type BoletoPaymentDetails = z.infer<typeof boletoPaymentDetailsSchema>;

export const paymentRecordSchema = z.object({
  paymentId: z.string().min(1).max(64),
  status: paymentStatusSchema,
  method: paymentMethodSchema,
  amountCents: z.number().int().positive(),
  netAmountCents: z.number().int().nonnegative().optional(),
  customerId: z.string().min(1).max(64),
  description: z.string().max(500),
  pix: pixPaymentDetailsSchema.optional(),
  boleto: boletoPaymentDetailsSchema.optional(),
  createdAt: z.string().datetime(),
  confirmedAt: z.string().datetime().optional(),
});
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;

export const customerRecordSchema = z.object({
  customerId: z.string().min(1).max(64),
  name: z.string().min(2).max(140),
  email: z.string().email(),
  document: z.string().min(11).max(18),
});
export type CustomerRecord = z.infer<typeof customerRecordSchema>;

export const gatewayConnectivityResultSchema = z.object({
  ok: z.boolean(),
  environment: gatewayEnvironmentSchema,
  latencyMs: z.number().int().nonnegative(),
  message: z.string().max(500),
});
export type GatewayConnectivityResult = z.infer<typeof gatewayConnectivityResultSchema>;

export const normalizedWebhookEventSchema = z.object({
  eventId: z.string().min(1).max(128),
  eventType: z.enum([
    'PAYMENT_RECEIVED',
    'PAYMENT_CONFIRMED',
    'PAYMENT_OVERDUE',
    'PAYMENT_REFUNDED',
    'PAYMENT_DELETED',
    'UNKNOWN',
  ]),
  paymentId: z.string().min(1).max(64).optional(),
  amountCents: z.number().int().nonnegative().optional(),
  status: paymentStatusSchema.optional(),
  occurredAt: z.string().datetime(),
  rawFingerprint: z.string().min(8).max(128),
});
export type NormalizedWebhookEvent = z.infer<typeof normalizedWebhookEventSchema>;

export const incomingWebhookPayloadSchema = z.object({
  headers: z.record(z.string(), z.string()),
  body: z.unknown(),
});
export type IncomingWebhookPayload = z.infer<typeof incomingWebhookPayloadSchema>;
