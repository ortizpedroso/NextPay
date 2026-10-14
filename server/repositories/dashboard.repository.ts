import { prisma } from '../db.js';
import { ChargeStatus } from '@prisma/client';

export async function getDashboardMetrics(accountId: string, days: number = 30) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  const charges = await prisma.charge.findMany({
    where: {
      accountId,
      createdAt: { gte: startDate },
    },
    include: {
      customer: true,
      paymentLink: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  let totalGrossCents = 0;
  let receivedCents = 0;
  let pendingCents = 0;
  let feeCents = 0;
  let netCents = 0;
  let countReceived = 0;
  let countPending = 0;
  let countOverdue = 0;

  for (const c of charges) {
    totalGrossCents += c.amountCents;
    if (c.status === ChargeStatus.RECEIVED || c.status === ChargeStatus.CONFIRMED) {
      receivedCents += c.amountCents;
      feeCents += c.feeCents;
      netCents += c.netCents;
      countReceived++;
    } else if (c.status === ChargeStatus.PENDING) {
      pendingCents += c.amountCents;
      countPending++;
    } else if (c.status === ChargeStatus.OVERDUE) {
      countOverdue++;
    }
  }

  // Agrupamento diário para o gráfico
  const dailyMap = new Map<
    string,
    { date: string; pix: number; card: number; boleto: number; total: number }
  >();

  // Preencher todos os dias do período
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { date: key, pix: 0, card: 0, boleto: 0, total: 0 });
  }

  for (const c of charges) {
    const key = c.createdAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      const val = c.amountCents / 100;
      entry.total += val;
      if (c.method === 'PIX') entry.pix += val;
      else if (c.method === 'CREDIT_CARD') entry.card += val;
      else if (c.method === 'BOLETO') entry.boleto += val;
    }
  }

  const chartData = Array.from(dailyMap.values()).map((e) => ({
    ...e,
    label: new Date(`${e.date}T12:00:00Z`).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  return {
    account: account
      ? {
          id: account.id,
          name: account.name,
          email: account.email,
          cpfCnpj: account.cpfCnpj,
          phone: account.phone,
          bankName: account.bankName,
          bankCode: account.bankCode,
          agency: account.agency,
          account: account.account,
          accountType: account.accountType,
          pixKey: account.pixKey,
          balanceCents: account.balanceCents,
        }
      : null,
    kpis: {
      days,
      balanceCents: account?.balanceCents ?? 0,
      totalGrossCents,
      receivedCents,
      pendingCents,
      feeCents,
      netCents,
      totalCount: charges.length,
      countReceived,
      countPending,
      countOverdue,
    },
    chartData,
    recentCharges: charges.slice(0, 10),
  };
}
