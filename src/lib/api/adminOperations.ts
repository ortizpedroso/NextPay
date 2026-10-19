import { dashboardAuthHeaders } from './dashboardAuth';

export async function createAdminPayment(input: {
  amountCents: number;
  method: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  description: string;
  customerId: string;
  idempotencyKey: string;
}): Promise<{ payment: { paymentId: string; status: string } }> {
  const response = await fetch('/api/v1/payments', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify({ ...input, environment: 'SANDBOX' }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao emitir cobrança.');
  }
  return (await response.json()) as { payment: { paymentId: string; status: string } };
}

export async function requestWithdrawal(input: {
  amountCents: number;
  pixKey: string;
}): Promise<{ protocol: string; status: string }> {
  const response = await fetch('/api/v1/withdrawals', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao solicitar saque.');
  }
  return (await response.json()) as { protocol: string; status: string };
}

export type LedgerTransactionDto = {
  neutralPaymentId: string;
  amountCents: number;
  netAmountCents?: number | null;
  status: string;
  method: string;
  description: string;
  customerName?: string | null;
};

export async function fetchLedgerTransactions(): Promise<LedgerTransactionDto[]> {
  const response = await fetch('/api/v1/transactions', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { transactions: LedgerTransactionDto[] };
  return json.transactions;
}

export type MerchantCustomerDto = {
  neutralCustomerId: string;
  name: string;
  email: string;
  document: string;
};

export async function fetchMerchantCustomers(): Promise<MerchantCustomerDto[]> {
  const response = await fetch('/api/v1/customers', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { customers: MerchantCustomerDto[] };
  return json.customers;
}

export type CatalogProductDto = {
  productPublicId: string;
  urlSlug: string;
  title: string;
  description: string;
  category: 'servicos' | 'digitais' | 'recorrentes' | 'projetos';
  badge?: string | null;
  priceCents: number;
  billingType: 'avulsa' | 'recorrente';
  recurrencyCycle?: string | null;
  maxInstallments: number;
  imageUrl: string;
  salesCount: number;
  status: string;
  checkoutUrl: string;
};

export type PaymentLinkDto = {
  linkPublicId: string;
  urlSlug: string;
  title: string;
  subtitle: string;
  billingType: 'avulsa' | 'recorrente';
  status: 'ACTIVE' | 'PAUSED';
  amountCents: number;
  totalBilledCents: number;
  salesCount: number;
  viewCount: number;
  expiresAt: string | null;
  productPublicId: string | null;
  checkoutUrl: string;
};

export async function fetchCatalogProducts(): Promise<CatalogProductDto[]> {
  const response = await fetch('/api/v1/products', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { products: CatalogProductDto[] };
  return json.products;
}

export async function createCatalogProduct(input: {
  title: string;
  description?: string;
  category: CatalogProductDto['category'];
  priceCents: number;
  billingType: CatalogProductDto['billingType'];
  maxInstallments?: number;
  imageUrl?: string;
  badge?: string;
}): Promise<CatalogProductDto> {
  const response = await fetch('/api/v1/products', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao cadastrar produto.');
  }
  const json = (await response.json()) as { product: CatalogProductDto };
  return json.product;
}

export async function fetchPaymentLinks(): Promise<PaymentLinkDto[]> {
  const response = await fetch('/api/v1/payment-links', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { paymentLinks: PaymentLinkDto[] };
  return json.paymentLinks;
}

export async function createPaymentLink(input: {
  title: string;
  subtitle?: string;
  billingType: PaymentLinkDto['billingType'];
  amountCents: number;
  expiresAt?: string;
  productPublicId?: string;
}): Promise<PaymentLinkDto> {
  const response = await fetch('/api/v1/payment-links', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao criar link de pagamento.');
  }
  const json = (await response.json()) as { paymentLink: PaymentLinkDto };
  return json.paymentLink;
}
