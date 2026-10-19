/**
 * Tipos internos (servidor) para mapeamento HTTP — nunca exportar ao frontend ou APIs públicas.
 */

export interface InternalHttpConfig {
  baseUrl: string;
  accessToken: string;
  timeoutMs: number;
}

export interface InternalRawPayment {
  externalId: string;
  status: string;
  billingType: string;
  value: number;
  netValue?: number;
  customer: string;
  description?: string;
  dueDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  identificationField?: string;
  pixQrCodeId?: string;
  pixCopyPaste?: string;
  dateCreated?: string;
  confirmedDate?: string;
}

export interface InternalRawCustomer {
  externalId: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

export interface InternalWebhookEnvelope {
  event: string;
  payment?: InternalRawPayment;
}
