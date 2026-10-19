import type {
  InternalHttpConfig,
  InternalRawCustomer,
  InternalRawPayment,
} from './internal-http.types';

export class ProcessorPrimaryHttpClient {
  constructor(private readonly config: InternalHttpConfig) {}

  async ping(): Promise<{ latencyMs: number }> {
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(`${this.config.baseUrl}/finance/balance`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Falha de conectividade (${response.status}).`);
      }

      return { latencyMs: Date.now() - started };
    } finally {
      clearTimeout(timer);
    }
  }

  async createCustomer(input: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
  }): Promise<InternalRawCustomer> {
    const response = await this.postJson<{
      id: string;
      name: string;
      email: string;
      cpfCnpj: string;
    }>('/customers', input);
    return {
      externalId: response.id,
      name: response.name,
      email: response.email,
      cpfCnpj: response.cpfCnpj,
    };
  }

  async createPayment(body: Record<string, unknown>): Promise<InternalRawPayment> {
    const response = await this.postJson<Record<string, unknown>>('/payments', body);
    return this.mapPayment(response);
  }

  async getPayment(externalId: string): Promise<InternalRawPayment> {
    const response = await this.getJson<Record<string, unknown>>(`/payments/${externalId}`);
    return this.mapPayment(response);
  }

  async cancelPayment(externalId: string): Promise<InternalRawPayment> {
    const response = await this.deleteJson<Record<string, unknown>>(`/payments/${externalId}`);
    return this.mapPayment(response);
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      access_token: this.config.accessToken,
    };
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });
    return this.parseJson<T>(response);
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'GET',
      headers: this.buildHeaders(),
    });
    return this.parseJson<T>(response);
  }

  private async deleteJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });
    return this.parseJson<T>(response);
  }

  private async parseJson<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}: ${text.slice(0, 200)}`);
    }
    return JSON.parse(text) as T;
  }

  private mapPayment(raw: Record<string, unknown>): InternalRawPayment {
    return {
      externalId: String(raw.id ?? ''),
      status: String(raw.status ?? 'PENDING'),
      billingType: String(raw.billingType ?? 'UNDEFINED'),
      value: Number(raw.value ?? 0),
      netValue: raw.netValue !== undefined ? Number(raw.netValue) : undefined,
      customer: String(raw.customer ?? ''),
      description: raw.description ? String(raw.description) : undefined,
      dueDate: raw.dueDate ? String(raw.dueDate) : undefined,
      invoiceUrl: raw.invoiceUrl ? String(raw.invoiceUrl) : undefined,
      bankSlipUrl: raw.bankSlipUrl ? String(raw.bankSlipUrl) : undefined,
      identificationField: raw.identificationField ? String(raw.identificationField) : undefined,
      pixCopyPaste: raw.pixCopyPaste ? String(raw.pixCopyPaste) : undefined,
      dateCreated: raw.dateCreated ? String(raw.dateCreated) : undefined,
      confirmedDate: raw.confirmedDate ? String(raw.confirmedDate) : undefined,
    };
  }
}

export function resolveProcessorBaseUrl(environment: 'SANDBOX' | 'PRODUCTION'): string {
  if (environment === 'PRODUCTION') {
    return (
      process.env.PROCESSOR_API_BASE_URL_PRODUCTION?.trim() ||
      'https://api.primary-processor.invalid/v3'
    );
  }
  return (
    process.env.PROCESSOR_API_BASE_URL_SANDBOX?.trim() ||
    'https://api.sandbox-primary-processor.invalid/v3'
  );
}
