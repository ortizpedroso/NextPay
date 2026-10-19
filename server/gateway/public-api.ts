/**
 * Superfície pública exportável do gateway (sem dependências de adaptadores internos).
 */
export type {
  BoletoPaymentDetails,
  CreateCustomerInput,
  CreatePaymentInput,
  CustomerRecord,
  GatewayConnectivityResult,
  GatewayEnvironmentDto,
  IncomingWebhookPayload,
  NormalizedWebhookEvent,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  PixPaymentDetails,
} from './dtos';

export type {
  IdempotencyStore,
  PaymentGatewayFactory,
  PaymentGatewayInterface,
} from './payment-gateway.interface';

export {
  createCustomerInputSchema,
  createPaymentInputSchema,
  customerRecordSchema,
  gatewayConnectivityResultSchema,
  normalizedWebhookEventSchema,
  paymentRecordSchema,
} from './dtos';

export { hashIdempotentRequest, IdempotencyConflictError, withIdempotency } from './idempotency';
