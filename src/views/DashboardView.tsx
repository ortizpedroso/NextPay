import React, { useState } from 'react';
import { Transaction } from '../data/mockData';
import type { MerchantProfileDto } from '../lib/api/merchantProfile';
import { formatBRL } from '../lib/format';

interface DashboardViewProps {
  transactions: Transaction[];
  availableBalance: number;
  merchantProfile: MerchantProfileDto | null;
  metrics?: {
    ledgerTransactionCount: number;
    activePaymentLinks: number;
    activeProducts: number;
    inboundWebhookEvents: number;
  } | null;
  onOpenWithdraw: () => void;
  onOpenReceipt: (tx?: Transaction) => void;
  onOpenQrPix: (title: string, price: string) => void;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  availableBalance,
  metrics,
  merchantProfile,
  onOpenWithdraw,
  onOpenReceipt,
  onOpenQrPix,
  onNavigate,
  _onShowToast,
}: DashboardViewProps & { _onShowToast?: DashboardViewProps['onShowToast'] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '14' | '7'>('30');
  const [txFilter, setTxFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const grossFromLedger = transactions.reduce((sum, tx) => sum + tx.grossAmount, 0);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (txFilter === 'todos') return true;
    if (txFilter === 'pix') return tx.method === 'Pix';
    if (txFilter === 'cartao') return tx.method === 'Cartão';
    if (txFilter === 'boleto') return tx.method === 'Boleto';
    if (txFilter === 'pagas')
      return (
        tx.status === 'Liquidado' || tx.status === 'Confirmado' || tx.status === 'Previsto D+32'
      );
    if (txFilter === 'pendentes')
      return tx.status === 'Aguardando' || tx.status === 'Pendente' || tx.status === 'Vencido';

    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 lg:px-space-xl py-space-lg space-y-space-lg max-w-[1600px] mx-auto w-full">
        {/* BANNER DE LIQUIDAÇÃO NEXTPAY */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse"></span>
                  Liquidação Automática D+0
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  NextPay Liquidação Centralizada
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface mt-0.5 truncate">
                Saldo disponível:{' '}
                <strong>
                  R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
                {merchantProfile?.email ? (
                  <>
                    {' '}
                    • titular <strong>{merchantProfile.email}</strong>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenReceipt()}
              className="font-label-md text-label-md text-primary hover:text-primary-container flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span>Ver comprovante</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS FINANCEIRAS PRINCIPAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Saldo Disponível */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between relative overflow-hidden group border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Saldo em Conta
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-container/40 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                    R$
                  </span>
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Disponível para Pix Imediato
                </p>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm">
              <button
                type="button"
                onClick={onOpenWithdraw}
                className="w-full py-2 px-3 rounded-lg bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant transition-all font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                <span>Solicitar Saque D+0</span>
              </button>
            </div>
          </div>

          {/* Card 2: Lucro do Dono do Gateway (NextPay Spread) */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-secondary/40 hover:shadow-md transition-shadow bg-secondary-container/10">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-secondary font-bold">
                  Seu Lucro no Gateway (Spread)
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-container/60 text-secondary">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-md text-label-md text-secondary font-semibold">
                    R$
                  </span>
                  <span className="font-numeric-lg text-numeric-lg text-secondary font-bold tracking-tight">
                    {formatBRL(Math.round((merchantProfile?.grossVolumeCents ?? 0) * 0.01))}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary">
                    verified
                  </span>
                  Margem: 1,00% + R$ 0,49 por venda
                </p>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-body-sm font-body-sm border-t border-surface-container/60 pt-2">
              <span className="text-on-surface-variant">Simulador de Lucro:</span>
              <span className="font-semibold text-secondary/60 flex items-center gap-1 cursor-not-allowed text-xs">
                <span>Simular Venda</span>
                <span className="text-[9px] uppercase px-1 rounded bg-surface-container-highest text-outline">
                  Em breve
                </span>
              </span>
            </div>
          </div>

          {/* Card 3: A Liberar / Antecipações */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  A Liberar (Cartão 32 dias)
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                    R$
                  </span>
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    12.700,00
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-outline">
                    schedule
                  </span>
                  Fluxo padrão de liquidação D+32
                </p>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between text-body-sm font-body-sm border-t border-surface-container/60 pt-2">
              <span className="text-on-surface-variant">Antecipação pré-aprovada:</span>
              <span
                className="font-semibold text-primary/60 flex items-center gap-1 cursor-not-allowed text-xs"
                title="Em breve"
              >
                <span>R$ 12.484,10</span>
                <span className="text-[9px] uppercase px-1 rounded bg-surface-container-highest text-outline">
                  Em breve
                </span>
              </span>
            </div>
          </div>

          {/* Card 4: Faturamento Total */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Faturamento Bruto (Mês)
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                </span>
              </div>
              <div className="mt-space-md">
                <div className="flex items-baseline gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                    R$
                  </span>
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    {grossFromLedger.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-body-sm text-body-sm text-outline">
                    {metrics
                      ? `${metrics.ledgerTransactionCount} transações • ${metrics.activeProducts} produtos • ${metrics.activePaymentLinks} links`
                      : `${transactions.length} transações carregadas`}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-space-lg pt-space-sm flex items-center justify-between border-t border-surface-container/60 pt-2">
              <span className="font-body-sm text-body-sm text-outline">Cobranças Ativas:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded font-label-sm text-label-sm bg-surface-container-highest text-primary font-medium">
                WhatsApp & Pix Ativos
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO GRÁFICA & CONVERSÃO CENTRAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          {/* Volume 30 Dias (8 cols) */}
          <div className="lg:col-span-8 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pb-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Volume & Distribuição por Método
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Desempenho consolidado de liquidação com retenção de spread NextPay (
                    {selectedPeriod} dias)
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-surface-container">
                  {(['30', '14', '7'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all ${
                        selectedPeriod === period
                          ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {period} Dias
                    </button>
                  ))}
                </div>
              </div>

              {/* Métricas de Canais Breakdown */}
              <div className="grid grid-cols-3 gap-space-sm py-space-sm bg-surface-container-low rounded-lg px-space-md my-space-sm border border-surface-container/60">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Pix Instantâneo
                    </span>
                  </div>
                  <span className="font-numeric-md text-numeric-md font-semibold text-on-surface mt-0.5">
                    58% <span className="text-outline font-normal">(R$ 28.100)</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-tertiary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Cartão de Crédito
                    </span>
                  </div>
                  <span className="font-numeric-md text-numeric-md font-semibold text-on-surface mt-0.5">
                    34% <span className="text-outline font-normal">(R$ 16.470)</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Boleto Bancário
                    </span>
                  </div>
                  <span className="font-numeric-md text-numeric-md font-semibold text-on-surface mt-0.5">
                    8% <span className="text-outline font-normal">(R$ 3.880)</span>
                  </span>
                </div>
              </div>

              {/* Gráfico SVG */}
              <div className="h-56 w-full pt-space-md relative flex flex-col justify-end">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 740 180"
                >
                  <defs>
                    <linearGradient id="pixGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#006c49" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#006c49" stopOpacity="0.0"></stop>
                    </linearGradient>
                    <linearGradient id="cardGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3e3fcc" stopOpacity="0.18"></stop>
                      <stop offset="100%" stopColor="#3e3fcc" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>

                  <line
                    stroke="#c3c6d7"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                    x1="0"
                    x2="740"
                    y1="20"
                    y2="20"
                  ></line>
                  <line
                    stroke="#c3c6d7"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                    x1="0"
                    x2="740"
                    y1="70"
                    y2="70"
                  ></line>
                  <line
                    stroke="#c3c6d7"
                    strokeDasharray="4 4"
                    strokeOpacity="0.4"
                    x1="0"
                    x2="740"
                    y1="120"
                    y2="120"
                  ></line>
                  <line
                    stroke="#c3c6d7"
                    strokeOpacity="0.4"
                    x1="0"
                    x2="740"
                    y1="170"
                    y2="170"
                  ></line>

                  <path
                    d="M 0,140 Q 60,110 120,125 T 240,80 T 360,95 T 480,45 T 600,60 T 740,25 L 740,170 L 0,170 Z"
                    fill="url(#pixGradient)"
                  ></path>
                  <path
                    d="M 0,140 Q 60,110 120,125 T 240,80 T 360,95 T 480,45 T 600,60 T 740,25"
                    fill="none"
                    stroke="#006c49"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  ></path>

                  <path
                    d="M 0,155 Q 60,140 120,135 T 240,120 T 360,110 T 480,90 T 600,105 T 740,75 L 740,170 L 0,170 Z"
                    fill="url(#cardGradient)"
                  ></path>
                  <path
                    d="M 0,155 Q 60,140 120,135 T 240,120 T 360,110 T 480,90 T 600,105 T 740,75"
                    fill="none"
                    stroke="#3e3fcc"
                    strokeLinecap="round"
                    strokeWidth="2"
                  ></path>

                  <circle
                    cx="740"
                    cy="25"
                    fill="#006c49"
                    r="4.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                  ></circle>
                </svg>

                <div className="flex justify-between items-center text-label-sm font-label-sm text-outline pt-2 px-1">
                  <span>01 Out</span>
                  <span>08 Out</span>
                  <span>15 Out</span>
                  <span>22 Out</span>
                  <span>Hoje (30 Out)</span>
                </div>
              </div>
            </div>

            <div className="mt-space-md pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between text-body-sm font-body-sm text-on-surface-variant gap-2 border-t border-surface-container/60">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  check_circle
                </span>
                Taxa Pix cobrada: <strong className="text-on-surface">1% + R$ 2,48</strong> (Lucro
                NextPay: 1% + R$ 0,49)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  credit_score
                </span>
                Cartão: <strong className="text-on-surface">3.99% + R$ 0,98</strong>
              </span>
            </div>
          </div>

          {/* Funil & Conversão (4 cols) */}
          <div className="lg:col-span-4 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div>
              <div className="flex items-center justify-between pb-space-sm">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Taxa de Conversão
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Cobranças emitidas vs liquidadas
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                </div>
              </div>

              {/* Donut ring KPI */}
              <div className="my-space-md p-space-md rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container/60">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Sucesso no Pix
                  </span>
                  <span className="font-display-lg text-display-lg text-secondary font-bold">
                    91.4%
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Tempo médio de pago: <strong>3.2 min</strong>
                  </span>
                </div>

                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                    <path
                      className="text-secondary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="91.4, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    ></path>
                  </svg>
                  <span className="material-symbols-outlined text-[18px] text-secondary absolute">
                    qr_code_2
                  </span>
                </div>
              </div>

              {/* Funnel bars */}
              <div className="space-y-space-md">
                <div>
                  <div className="flex justify-between items-center text-body-sm font-body-sm mb-1">
                    <span className="text-on-surface">Cobranças Geradas (148 un.)</span>
                    <span className="font-numeric-md font-semibold text-on-surface">R$ 48.450</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-body-sm font-body-sm mb-1">
                    <span className="text-on-surface">Acessadas pelo Pagador (139 un.)</span>
                    <span className="font-numeric-md font-semibold text-on-surface">93.9%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full"
                      style={{ width: '93.9%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-body-sm font-body-sm mb-1">
                    <span className="text-on-surface">Pagas e Compensadas (132 un.)</span>
                    <span className="font-numeric-md font-semibold text-secondary">
                      89.2% Global
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: '89.2%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-md pt-space-md bg-surface-container-low/60 -mx-space-lg -mb-space-lg p-space-md rounded-b-xl flex items-center justify-between border-t border-surface-container/60">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Boletos vencidos nos 30d:
              </span>
              <span className="font-label-md text-label-md font-semibold text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>3 pendências
              </span>
            </div>
          </div>
        </div>

        {/* 4 FAST ACTION TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center gap-space-md border border-surface-container/60 opacity-60 cursor-not-allowed select-none"
            title="Em breve"
          >
            <div className="h-12 w-12 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">calculate</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-title-md text-title-md text-on-surface font-bold">
                  Simular Venda
                </h3>
                <span className="text-[9px] uppercase px-1 rounded bg-surface-container-highest text-outline font-semibold">
                  Em breve
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                Calcule o spread de 1% + R$ 0,49
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('cobrancas-e-links')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-space-md group border border-surface-container/60"
          >
            <div className="h-12 w-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors font-semibold">
                Link de Pagamento
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                Compartilhe por WhatsApp e redes
              </p>
            </div>
            <span className="material-symbols-outlined text-outline ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <div
            onClick={() => onOpenQrPix('Cobrança Pix Expressa', 'R$ 450,00')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-space-md group border border-surface-container/60"
          >
            <div className="h-12 w-12 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">qr_code</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-title-md text-title-md text-on-surface group-hover:text-secondary transition-colors font-semibold">
                Pix Dinâmico
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                QR Code com baixa D+0
              </p>
            </div>
            <span className="material-symbols-outlined text-outline ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <div
            onClick={() => onNavigate('clientes')}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-space-md group border border-surface-container/60"
          >
            <div className="h-12 w-12 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-title-md text-title-md text-on-surface group-hover:text-tertiary transition-colors font-semibold">
                Meus Clientes
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant truncate">
                Gestão da base e históricos
              </p>
            </div>
            <span className="material-symbols-outlined text-outline ml-auto group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>
        </div>

        {/* TABELA DE TRANSAÇÕES RECENTES COM LUCRO DO GATEWAY */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container/60">
          <div className="p-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Extrato, Transações & Lucro NextPay
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lançamentos brutos, taxa aplicada ao lojista e{' '}
                <strong>seu ganho líquido (spread)</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-1 rounded-lg border border-surface-container">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pix', label: 'Pix', dot: 'bg-secondary' },
                { id: 'cartao', label: 'Cartão', dot: 'bg-tertiary' },
                { id: 'boleto', label: 'Boleto', dot: 'bg-primary' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTxFilter(btn.id)}
                  className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors flex items-center gap-1 ${
                    txFilter === btn.id
                      ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {btn.dot && <span className={`h-2 w-2 rounded-full ${btn.dot}`}></span>}
                  <span>{btn.label}</span>
                </button>
              ))}
              <div className="h-4 w-[1px] bg-outline-variant mx-1"></div>
              <button
                type="button"
                onClick={() => setTxFilter('pagas')}
                className={`px-3 py-1.5 rounded font-label-md text-label-md transition-colors ${
                  txFilter === 'pagas'
                    ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pagas
              </button>
            </div>
          </div>

          {/* Search bar inside ledger */}
          <div className="px-space-lg pb-3">
            <div className="relative max-w-sm">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Filtrar por pagador, descrição ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low text-body-sm rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-label-sm font-label-sm text-outline uppercase tracking-wider">
                  <th className="py-3 px-space-lg font-semibold">Cliente / Pagador</th>
                  <th className="py-3 px-space-md font-semibold">Descrição / Item</th>
                  <th className="py-3 px-space-md font-semibold">Método</th>
                  <th className="py-3 px-space-md font-semibold">Data / Hora</th>
                  <th className="py-3 px-space-md font-semibold text-right">Valor Bruto</th>
                  <th className="py-3 px-space-md font-semibold text-right">Taxa Cobrada</th>
                  <th className="py-3 px-space-md font-semibold text-right text-secondary">
                    Seu Lucro
                  </th>
                  <th className="py-3 px-space-md font-semibold text-right">Líquido Lojista</th>
                  <th className="py-3 px-space-lg font-semibold text-center">Status</th>
                  <th className="py-3 px-space-sm font-semibold text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-space-md px-space-lg">
                      <div className="flex items-center gap-space-sm">
                        <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant font-label-md text-label-md">
                          {tx.avatarInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-body-md font-semibold text-on-surface">
                            {tx.clientName}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline">
                            {tx.clientDoc}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium">{tx.description}</span>
                        <span className="font-label-sm text-label-sm text-outline font-mono">
                          {tx.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-space-md px-space-md whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label-sm font-label-sm font-semibold ${
                          tx.method === 'Pix'
                            ? 'bg-secondary-container/40 text-on-secondary-container'
                            : tx.method === 'Cartão'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {tx.method === 'Pix'
                            ? 'qr_code_2'
                            : tx.method === 'Cartão'
                              ? 'credit_card'
                              : 'receipt'}
                        </span>
                        {tx.methodDetail}
                      </span>
                    </td>
                    <td className="py-space-md px-space-md text-body-sm font-body-sm text-on-surface-variant whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-space-md px-space-md text-right font-numeric-md text-numeric-md font-semibold text-on-surface whitespace-nowrap">
                      {tx.grossAmountFormatted}
                    </td>
                    <td className="py-space-md px-space-md text-right font-numeric-md text-numeric-md text-error whitespace-nowrap">
                      {tx.gatewayFeeFormatted}
                    </td>
                    <td className="py-space-md px-space-md text-right font-numeric-md text-numeric-md font-bold text-secondary whitespace-nowrap">
                      {tx.gatewayProfitFormatted}
                    </td>
                    <td className="py-space-md px-space-md text-right font-numeric-md text-numeric-md font-bold text-on-surface whitespace-nowrap">
                      {tx.netAmountFormatted}
                    </td>
                    <td className="py-space-md px-space-lg text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
                          tx.status === 'Liquidado' || tx.status === 'Confirmado'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : tx.status === 'Previsto D+32'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : tx.status === 'Vencido'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            tx.status === 'Liquidado' || tx.status === 'Confirmado'
                              ? 'bg-secondary'
                              : tx.status === 'Vencido'
                                ? 'bg-error'
                                : tx.status === 'Previsto D+32'
                                  ? 'bg-tertiary'
                                  : 'bg-outline'
                          }`}
                        ></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-space-md px-space-sm text-center">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(tx)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                        title="Ver Comprovante"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
