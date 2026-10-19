import { getAdminBearerToken } from './adminSession';

function adminHeaders(): HeadersInit {
  const token = getAdminBearerToken();
  if (!token) {
    throw new Error('Sessão administrativa não configurada.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function createAdminPayment(input: {
  amountCents: number;
  method: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  description: string;
  customerId: string;
  idempotencyKey: string;
}): Promise<{ payment: { paymentId: string; status: string } }> {
  const response = await fetch('/api/v1/payments', {
    method: 'POST',
    headers: adminHeaders(),
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
    headers: adminHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao solicitar saque.');
  }
  return (await response.json()) as { protocol: string; status: string };
}

export async function fetchLedgerTransactions(): Promise<
  Array<{
    neutralPaymentId: string;
    amountCents: number;
    status: string;
    method: string;
    description: string;
    customerName?: string | null;
  }>
> {
  const response = await fetch('/api/v1/transactions', { headers: adminHeaders() });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as {
    transactions: Array<{
      neutralPaymentId: string;
      amountCents: number;
      status: string;
      method: string;
      description: string;
      customerName?: string | null;
    }>;
  };
  return json.transactions;
}
