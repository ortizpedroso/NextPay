import type {
  CreateCustomerInput,
  CreatePaymentInput,
  CustomerRecord,
  GatewayConnectivityResult,
  GatewayEnvironmentDto,
  IncomingWebhookPayload,
  NormalizedWebhookEvent,
  PaymentRecord,
} from './dtos';

/**
 * Contrato agnóstico do motor de pagamentos NextPay.
 * Implementações concretas ficam em camada interna (servidor) e nunca expõem a processadora subjacente.
 */
export interface PaymentGatewayInterface {
  readonly environment: GatewayEnvironmentDto;

  testConnectivity(): Promise<GatewayConnectivityResult>;

  createCustomer(input: CreateCustomerInput): Promise<CustomerRecord>;

  createPayment(input: CreatePaymentInput): Promise<PaymentRecord>;

  getPayment(paymentId: string): Promise<PaymentRecord>;

  cancelPayment(paymentId: string): Promise<PaymentRecord>;

  /**
   * Normaliza eventos HTTP recebidos no endpoint público de webhooks da plataforma.
   */
  parseIncomingWebhook(payload: IncomingWebhookPayload): NormalizedWebhookEvent;
}

export interface IdempotencyStore {
  /**
   * Retorna resposta previamente persistida ou null se a chave não existir / expirou.
   */
  get(operation: string, idempotencyKey: string, requestHash: string): Promise<string | null>;

  /**
   * Persiste resposta serializada (JSON) associada à chave. Deve falhar se chave já existir com hash diferente.
   */
  save(
    operation: string,
    idempotencyKey: string,
    requestHash: string,
    responseJson: string,
    ttlMs: number,
  ): Promise<void>;
}

export interface PaymentGatewayFactory {
  createForEnvironment(environment: GatewayEnvironmentDto): Promise<PaymentGatewayInterface>;
}
