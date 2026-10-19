import { createHash } from 'node:crypto';

import type {
  CreateCustomerInput,
  CreatePaymentInput,
  CustomerRecord,
  GatewayConnectivityResult,
  IncomingWebhookPayload,
  NormalizedWebhookEvent,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
} from '../dtos';
import { createCustomerInputSchema, createPaymentInputSchema, paymentRecordSchema } from '../dtos';
import type { PaymentGatewayInterface } from '../payment-gateway.interface';
import {
  ProcessorPrimaryHttpClient,
  resolveProcessorBaseUrl,
} from '../../infra/processor-primary/internal-http.client';
import type { InternalWebhookEnvelope } from '../../infra/processor-primary/internal-http.types';
import { resolveProcessorSplit } from '../../config/splitConfig';
import type { CorrelationStore } from '../../payments/correlationStore';

const NEUTRAL_ID_PREFIX = 'np';

export class PrimaryProcessorGatewayAdapter implements PaymentGatewayInterface {
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  private readonly externalIdsByNeutralId = new Map<string, string>();

  constructor(
    environment: 'SANDBOX' | 'PRODUCTION',
    private readonly http: ProcessorPrimaryHttpClient,
    private readonly correlationStore?: CorrelationStore,
    private readonly defaultSplitWalletId?: string,
  ) {
    this.environment = environment;
  }

  static create(
    environment: 'SANDBOX' | 'PRODUCTION',
    accessToken: string,
    correlationStore?: CorrelationStore,
    defaultSplitWalletId?: string,
  ): PrimaryProcessorGatewayAdapter {
    const http = new ProcessorPrimaryHttpClient({
      baseUrl: resolveProcessorBaseUrl(environment),
      accessToken,
      timeoutMs: 15_000,
    });
    return new PrimaryProcessorGatewayAdapter(
      environment,
      http,
      correlationStore,
      defaultSplitWalletId,
    );
  }

  async testConnectivity(): Promise<GatewayConnectivityResult> {
    try {
      const { latencyMs } = await this.http.ping();
      return {
        ok: true,
        environment: this.environment,
        latencyMs,
        message: 'Conexão estabelecida com o processador primário.',
      };
    } catch (error) {
      return {
        ok: false,
        environment: this.environment,
        latencyMs: 0,
        message: error instanceof Error ? error.message : 'Falha de conectividade.',
      };
    }
  }

  async createCustomer(input: CreateCustomerInput): Promise<CustomerRecord> {
    const parsed = createCustomerInputSchema.parse(input);
    const raw = await this.http.createCustomer({
      name: parsed.name,
      email: parsed.email,
      cpfCnpj: parsed.document,
      phone: parsed.phone,
    });

    const customerId = toNeutralId('cus', raw.externalId);
    await this.persistMapping(customerId, raw.externalId, 'cus');

    return {
      customerId,
      name: raw.name,
      email: raw.email,
      document: raw.cpfCnpj,
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    const parsed = createPaymentInputSchema.parse(input);
    const customerExternalId =
      this.externalIdsByNeutralId.get(parsed.customerId) ?? parsed.customerId;

    const paymentBody: Record<string, unknown> = {
      customer: customerExternalId,
      billingType: mapMethodToBillingType(parsed.method),
      value: parsed.amountCents / 100,
      dueDate: parsed.dueDate,
      description: parsed.description,
      externalReference: parsed.externalReference ?? parsed.idempotencyKey,
      installmentCount: parsed.installmentCount,
    };

    const split = resolveProcessorSplit({
      splitWalletId: parsed.splitWalletId ?? this.defaultSplitWalletId,
      amountCents: parsed.amountCents,
    });
    if (split) {
      paymentBody.split = split;
    }

    const raw = await this.http.createPayment(paymentBody);

    const mapped = mapRawPaymentToRecord(raw);
    await this.persistMapping(mapped.paymentId, raw.externalId, 'pay');
    await this.persistMapping(mapped.customerId, raw.customer, 'cus');
    paymentRecordSchema.parse(mapped);
    return mapped;
  }

  async getPayment(paymentId: string): Promise<PaymentRecord> {
    const externalId = await this.resolveExternalId(paymentId, 'pay');
    const raw = await this.http.getPayment(externalId);
    const mapped = mapRawPaymentToRecord(raw);
    paymentRecordSchema.parse(mapped);
    return mapped;
  }

  async cancelPayment(paymentId: string): Promise<PaymentRecord> {
    const externalId = await this.resolveExternalId(paymentId, 'pay');
    const raw = await this.http.cancelPayment(externalId);
    const mapped = mapRawPaymentToRecord(raw);
    paymentRecordSchema.parse(mapped);
    return mapped;
  }

  parseIncomingWebhook(payload: IncomingWebhookPayload): NormalizedWebhookEvent {
    const body = payload.body as InternalWebhookEnvelope;
    const eventType = mapWebhookEventType(body.event);
    const payment = body.payment;
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(payload.body))
      .digest('hex')
      .slice(0, 32);

    const externalPaymentId = payment
      ? String(
          (payment as { id?: string; externalId?: string }).id ??
            (payment as { externalId?: string }).externalId ??
            '',
        )
      : '';

    return {
      eventId: fingerprint,
      eventType,
      paymentId: externalPaymentId ? toNeutralId('pay', externalPaymentId) : undefined,
      amountCents: payment ? Math.round(payment.value * 100) : undefined,
      status: payment ? mapRawStatus(payment.status) : undefined,
      occurredAt: new Date().toISOString(),
      rawFingerprint: fingerprint,
    };
  }

  private async resolveExternalId(neutralId: string, kind: 'pay' | 'cus'): Promise<string> {
    const cached = this.externalIdsByNeutralId.get(neutralId);
    if (cached) {
      return cached;
    }

    if (this.correlationStore) {
      const persisted = await this.correlationStore.getExternalId(neutralId);
      if (persisted) {
        this.externalIdsByNeutralId.set(neutralId, persisted);
        return persisted;
      }
    }

    if (!neutralId.startsWith(`${NEUTRAL_ID_PREFIX}_${kind}_`)) {
      throw new Error('Identificador neutro inválido.');
    }
    throw new Error(
      'Mapeamento de ID neutro não encontrado. Persistência de correlação é necessária.',
    );
  }

  private async persistMapping(
    neutralId: string,
    externalId: string,
    entityType: 'pay' | 'cus',
  ): Promise<void> {
    this.externalIdsByNeutralId.set(neutralId, externalId);
    if (!this.correlationStore || !externalId) {
      return;
    }
    await this.correlationStore.saveMapping({
      neutralId,
      externalId,
      entityType,
      environment: this.environment,
    });
  }
}

function toNeutralId(kind: 'pay' | 'cus', externalId: string): string {
  const digest = createHash('sha256').update(`${kind}:${externalId}`).digest('hex').slice(0, 24);
  return `${NEUTRAL_ID_PREFIX}_${kind}_${digest}`;
}

function mapMethodToBillingType(method: PaymentMethod): string {
  switch (method) {
    case 'PIX':
      return 'PIX';
    case 'CREDIT_CARD':
      return 'CREDIT_CARD';
    case 'BOLETO':
      return 'BOLETO';
    case 'DEBIT_CARD':
      return 'DEBIT_CARD';
    default:
      return 'UNDEFINED';
  }
}

function mapRawStatus(status: string): PaymentStatus {
  const normalized = status.toUpperCase();
  const allowed: PaymentStatus[] = [
    'PENDING',
    'CONFIRMED',
    'RECEIVED',
    'OVERDUE',
    'REFUNDED',
    'CANCELLED',
    'FAILED',
  ];
  return (allowed.find((s) => s === normalized) ?? 'PENDING') as PaymentStatus;
}

function mapRawPaymentToRecord(raw: {
  externalId: string;
  status: string;
  billingType: string;
  value: number;
  netValue?: number;
  customer: string;
  description?: string;
  dueDate?: string;
  identificationField?: string;
  bankSlipUrl?: string;
  pixCopyPaste?: string;
  dateCreated?: string;
  confirmedDate?: string;
}): PaymentRecord {
  const method = mapBillingTypeToMethod(raw.billingType);
  const record: PaymentRecord = {
    paymentId: toNeutralId('pay', raw.externalId),
    status: mapRawStatus(raw.status),
    method,
    amountCents: Math.round(raw.value * 100),
    netAmountCents: raw.netValue !== undefined ? Math.round(raw.netValue * 100) : undefined,
    customerId: toNeutralId('cus', raw.customer),
    description: raw.description ?? '',
    createdAt: raw.dateCreated ?? new Date().toISOString(),
    confirmedAt: raw.confirmedDate,
  };

  if (method === 'PIX' && raw.pixCopyPaste) {
    record.pix = {
      qrCodePayload: raw.pixCopyPaste,
      copyPasteCode: raw.pixCopyPaste,
    };
  }

  if (method === 'BOLETO') {
    record.boleto = {
      digitableLine: raw.identificationField ?? '',
      pdfUrl: raw.bankSlipUrl,
      dueDate: raw.dueDate ?? new Date().toISOString(),
    };
  }

  return record;
}

function mapBillingTypeToMethod(billingType: string): PaymentMethod {
  switch (billingType.toUpperCase()) {
    case 'PIX':
      return 'PIX';
    case 'BOLETO':
      return 'BOLETO';
    case 'DEBIT_CARD':
      return 'DEBIT_CARD';
    default:
      return 'CREDIT_CARD';
  }
}

function mapWebhookEventType(event: string | undefined): NormalizedWebhookEvent['eventType'] {
  switch ((event ?? '').toUpperCase()) {
    case 'PAYMENT_RECEIVED':
      return 'PAYMENT_RECEIVED';
    case 'PAYMENT_CONFIRMED':
      return 'PAYMENT_CONFIRMED';
    case 'PAYMENT_OVERDUE':
      return 'PAYMENT_OVERDUE';
    case 'PAYMENT_REFUNDED':
      return 'PAYMENT_REFUNDED';
    case 'PAYMENT_DELETED':
      return 'PAYMENT_DELETED';
    default:
      return 'UNKNOWN';
  }
}
