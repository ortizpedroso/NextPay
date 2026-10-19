import type { ClientRow, Transaction } from '../../data/mockData';

import type { MerchantCustomerDto } from './adminOperations';

import { formatBRL } from '../format';

type LedgerRow = {
  neutralPaymentId: string;
  amountCents: number;
  netAmountCents?: number | null;
  status: string;
  method: string;
  description: string;
  customerName?: string | null;
};

function mapMethod(method: string): Transaction['method'] {
  if (method === 'PIX') return 'Pix';
  if (method === 'BOLETO') return 'Boleto';
  if (method === 'CREDIT_CARD') return 'Cartão';
  if (method === 'DEBIT_CARD') return 'Débito';
  return 'Pix';
}

function mapStatus(status: string): Transaction['status'] {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
      return 'Liquidado';
    case 'PENDING':
      return 'Aguardando';
    case 'OVERDUE':
      return 'Vencido';
    case 'CANCELLED':
    case 'FAILED':
      return 'Pendente';
    default:
      return 'Aguardando';
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ledgerRowToTransaction(row: LedgerRow): Transaction {
  const grossCents = row.amountCents;
  const netCents = row.netAmountCents ?? grossCents;
  const feeCents = Math.max(0, grossCents - netCents);
  const profitCents = Math.round(grossCents * 0.01) + 49;
  const method = mapMethod(row.method);
  const clientName = row.customerName?.trim() || 'Cliente NextPay';

  return {
    id: row.neutralPaymentId,
    clientName,
    clientDoc: '***.***.***-**',
    avatarInitials: initials(clientName),
    description: row.description,
    code: row.neutralPaymentId.replace(/^np_pay_/, '#PAY-').slice(0, 16),
    method,
    methodDetail:
      method === 'Pix'
        ? 'Pix D+0 Instantâneo'
        : method === 'Cartão'
          ? 'Cartão 1x'
          : 'Boleto CIP',
    date: 'Recente',
    grossAmount: grossCents / 100,
    grossAmountFormatted: formatBRL(grossCents),
    gatewayFeeFormatted: `- ${formatBRL(feeCents)}`,
    gatewayProfitFormatted: `+ ${formatBRL(profitCents)}`,
    netAmountFormatted: formatBRL(netCents),
    status: mapStatus(row.status),
    dueDate: 'Hoje',
  };
}

export function merchantCustomerToClientRow(customer: MerchantCustomerDto): ClientRow {
  return {
    id: customer.neutralCustomerId,
    name: customer.name,
    email: customer.email,
    cpfCnpj: customer.document,
    phone: '—',
    totalBilled: 'R$ 0,00',
    chargesCount: 0,
    status: 'Ativo',
    city: 'Brasil',
  };
}

export function sumAvailableBalanceCents(rows: LedgerRow[]): number {
  return rows
    .filter((row) => row.status === 'RECEIVED' || row.status === 'CONFIRMED')
    .reduce((acc, row) => acc + (row.netAmountCents ?? row.amountCents), 0);
}
