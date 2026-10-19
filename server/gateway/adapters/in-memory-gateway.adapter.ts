import { createHash, randomUUID } from 'node:crypto';

import type {
  CreateCustomerInput,
  CreatePaymentInput,
  CustomerRecord,
  GatewayConnectivityResult,
  IncomingWebhookPayload,
  NormalizedWebhookEvent,
  PaymentRecord,
} from '../dtos';
import { createCustomerInputSchema, createPaymentInputSchema, paymentRecordSchema } from '../dtos';
import type { PaymentGatewayInterface } from '../payment-gateway.interface';

/**
 * Adaptador em memória para testes de integração sem processadora externa.
 */
export class InMemoryPaymentGateway implements PaymentGatewayInterface {
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  private readonly customers = new Map<string, CustomerRecord>();
  private readonly payments = new Map<string, PaymentRecord>();

  constructor(environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') {
    this.environment = environment;
  }

  async testConnectivity(): Promise<GatewayConnectivityResult> {
    return {
      ok: true,
      environment: this.environment,
      latencyMs: 1,
      message: 'Conectividade simulada OK.',
    };
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerRecord> {
    const parsed = createCustomerInputSchema.parse(input);
    const record: CustomerRecord = {
      customerId: `np_cus_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      name: parsed.name,
      email: parsed.email,
      document: parsed.document,
    };
    this.customers.set(record.customerId, record);
    return record;
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const parsed = createPaymentInputSchema.parse(input);
    const now = new Date().toISOString();
    const paymentId = `np_pay_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

    const base: PaymentRecord = {
      paymentId,
      status: parsed.method === 'PIX' ? 'PENDING' : 'CONFIRMED',
      method: parsed.method,
      amountCents: parsed.amountCents,
      customerId: parsed.customerId,
      description: parsed.description,
      createdAt: now,
    };

    if (parsed.method === 'PIX') {
      base.pix = {
        qrCodePayload: `00020126PIX${paymentId}`,
        copyPasteCode: `00020126PIX${paymentId}`,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      };
    }

    if (parsed.method === 'BOLETO') {
      base.boleto = {
        digitableLine: '23790.00000 00000.000000 00000.000000 0 00000000000000',
        dueDate: parsed.dueDate ?? new Date(Date.now() + 3 * 86_400_000).toISOString(),
      };
    }

    paymentRecordSchema.parse(base);
    this.payments.set(paymentId, base);
    return base;
  }

  async getPayment(paymentId: string): Promise<PaymentRecord> {
    const found = this.payments.get(paymentId);
    if (!found) {
      throw new Error('Pagamento não encontrado.');
    }
    return found;
  }

  async cancelPayment(paymentId: string): Promise<PaymentRecord> {
    const found = await this.getPayment(paymentId);
    const updated: PaymentRecord = { ...found, status: 'CANCELLED' };
    this.payments.set(paymentId, updated);
    return updated;
  }

  parseIncomingWebhook(payload: IncomingWebhookPayload): NormalizedWebhookEvent {
    const body = payload.body as {
      event?: string;
      payment?: { id?: string; value?: number; status?: string };
    };
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(payload.body))
      .digest('hex')
      .slice(0, 32);

    const externalPaymentId = body.payment?.id ?? '';
    const paymentId = externalPaymentId
      ? externalPaymentId.startsWith('np_pay_')
        ? externalPaymentId
        : toNeutralPaymentId(externalPaymentId)
      : undefined;

    return {
      eventId: randomUUID(),
      eventType: 'PAYMENT_RECEIVED',
      paymentId,
      amountCents: body.payment?.value ? Math.round(body.payment.value * 100) : 0,
      status: body.payment?.status?.toUpperCase() === 'CONFIRMED' ? 'CONFIRMED' : 'RECEIVED',
      occurredAt: new Date().toISOString(),
      rawFingerprint: fingerprint,
    };
  }
}

function toNeutralPaymentId(externalId: string): string {
  const digest = createHash('sha256').update(`pay:${externalId}`).digest('hex').slice(0, 24);
  return `np_pay_${digest}`;
}
