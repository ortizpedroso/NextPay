export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccountData {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  agency?: string | null;
  account?: string | null;
  accountType?: string | null;
  pixKey?: string | null;
  balanceCents: number;
  balanceFormatted: string;
}

export interface CustomerData {
  id: string;
  accountId: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    charges: number;
  };
}

export interface ProductData {
  id: string;
  accountId: string;
  title: string;
  description?: string | null;
  category: string;
  priceCents: number;
  billingType: 'avulsa' | 'recorrente';
  cycle?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    paymentLinks: number;
  };
}

export interface PaymentLinkData {
  id: string;
  accountId: string;
  productId?: string | null;
  title: string;
  description?: string | null;
  amountCents: number;
  billingType: 'avulsa' | 'recorrente';
  slug: string;
  active: boolean;
  maxInstallments: number;
  enablePix: boolean;
  enableCard: boolean;
  enableBoleto: boolean;
  views: number;
  sales: number;
  createdAt: string;
  updatedAt: string;
  product?: ProductData | null;
  _count?: {
    charges: number;
  };
}

export interface ChargeData {
  id: string;
  accountId: string;
  customerId?: string | null;
  paymentLinkId?: string | null;
  description: string;
  amountCents: number;
  feeCents: number;
  netCents: number;
  method: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED';
  dueDate: string;
  paidAt?: string | null;
  asaasId?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  boletoBarcode?: string | null;
  boletoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerData | null;
  paymentLink?: PaymentLinkData | null;
}

export interface DashboardMetricsData {
  account: AccountData | null;
  kpis: {
    days: number;
    balanceCents: number;
    totalGrossCents: number;
    receivedCents: number;
    pendingCents: number;
    feeCents: number;
    netCents: number;
    totalCount: number;
    countReceived: number;
    countPending: number;
    countOverdue: number;
  };
  chartData: Array<{
    date: string;
    label: string;
    pix: number;
    card: number;
    boleto: number;
    total: number;
  }>;
  recentCharges: ChargeData[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `Erro ${response.status}`;
    let details: unknown = undefined;
    try {
      const data = await response.json();
      if (data && typeof data === 'object') {
        if ('error' in data) errorMsg = String(data.error);
        if ('details' in data) details = data.details;
      }
    } catch {
      // resposta não era JSON
    }
    throw new ApiError(response.status, errorMsg, details);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{ ok: boolean; db: boolean }>('/api/health'),

  // Account
  getAccount: () => request<AccountData>('/api/account'),

  // Products
  getProducts: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    category?: string;
    active?: boolean;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.q) search.set('q', params.q);
    if (params?.category) search.set('category', params.category);
    if (params?.active !== undefined) search.set('active', String(params.active));
    const qs = search.toString();
    return request<PaginatedResponse<ProductData>>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: string) => request<ProductData>(`/api/products/${id}`),
  createProduct: (data: Partial<ProductData>) =>
    request<ProductData>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<ProductData>) =>
    request<ProductData>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<{ ok: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Customers
  getCustomers: (params?: { page?: number; pageSize?: number; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.q) search.set('q', params.q);
    const qs = search.toString();
    return request<PaginatedResponse<CustomerData>>(`/api/customers${qs ? `?${qs}` : ''}`);
  },
  getCustomer: (id: string) => request<CustomerData>(`/api/customers/${id}`),
  createCustomer: (data: Partial<CustomerData>) =>
    request<CustomerData>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCustomer: (id: string, data: Partial<CustomerData>) =>
    request<CustomerData>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id: string) =>
    request<{ ok: boolean }>(`/api/customers/${id}`, {
      method: 'DELETE',
    }),

  // Payment Links
  getPaymentLinks: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    type?: 'avulsa' | 'recorrente';
    active?: boolean;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.q) search.set('q', params.q);
    if (params?.type) search.set('type', params.type);
    if (params?.active !== undefined) search.set('active', String(params.active));
    const qs = search.toString();
    return request<PaginatedResponse<PaymentLinkData>>(`/api/payment-links${qs ? `?${qs}` : ''}`);
  },
  getPaymentLink: (id: string) => request<PaymentLinkData>(`/api/payment-links/${id}`),
  createPaymentLink: (data: Partial<PaymentLinkData>) =>
    request<PaymentLinkData>('/api/payment-links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePaymentLink: (id: string, data: Partial<PaymentLinkData>) =>
    request<PaymentLinkData>(`/api/payment-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  togglePaymentLink: (id: string) =>
    request<PaymentLinkData>(`/api/payment-links/${id}/toggle`, {
      method: 'PATCH',
    }),
  deletePaymentLink: (id: string) =>
    request<{ ok: boolean }>(`/api/payment-links/${id}`, {
      method: 'DELETE',
    }),

  // Charges
  getCharges: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: string;
    method?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.q) search.set('q', params.q);
    if (params?.status) search.set('status', params.status);
    if (params?.method) search.set('method', params.method);
    const qs = search.toString();
    return request<PaginatedResponse<ChargeData>>(`/api/charges${qs ? `?${qs}` : ''}`);
  },
  getCharge: (id: string) => request<ChargeData>(`/api/charges/${id}`),
  createCharge: (data: {
    customerId?: string | null;
    paymentLinkId?: string | null;
    description: string;
    amountCents: number;
    method: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
    dueDate: string;
  }) =>
    request<ChargeData>('/api/charges', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: (days: number = 30) => request<DashboardMetricsData>(`/api/dashboard?days=${days}`),
};

export const DEFAULT_ACCOUNT: AccountData = {
  id: 'demo-account-1',
  name: 'NextPay Administrador',
  email: 'ortizphp@gmail.com',
  cpfCnpj: '12.345.678/0001-90',
  phone: '(11) 98822-1092',
  bankName: 'NextPay Instituição de Pagamento S.A',
  bankCode: '461',
  agency: '0001',
  account: '7342797-3',
  accountType: 'Conta Pagamento',
  pixKey: 'ortizphp@gmail.com',
  balanceCents: 4892050,
  balanceFormatted: 'R$ 48.920,50',
};
