import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, ChargeData } from '../api/client';

interface DashboardViewProps {
  onOpenWithdraw: () => void;
  onOpenReceipt: (charge?: ChargeData) => void;
  onOpenQrPix: (title: string, price: string) => void;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenWithdraw,
  onOpenReceipt,
  onOpenQrPix,
  onNavigate,
  _onShowToast,
}: DashboardViewProps & { _onShowToast?: DashboardViewProps['onShowToast'] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 14 | 7>(30);
  const [txFilter, setTxFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', selectedPeriod],
    queryFn: () => api.getDashboard(selectedPeriod),
  });

  const kpis = data?.kpis || {
    days: selectedPeriod,
    balanceCents: 4892050,
    totalGrossCents: 0,
    receivedCents: 0,
    pendingCents: 0,
    feeCents: 0,
    netCents: 0,
    totalCount: 0,
    countReceived: 0,
    countPending: 0,
    countOverdue: 0,
  };

  const chartData = data?.chartData || [];
  const recentCharges = data?.recentCharges || [];
  const account = data?.account;

  const availableBalance = (kpis.balanceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const totalGrossFormatted = (kpis.totalGrossCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const receivedFormatted = (kpis.receivedCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const pendingFormatted = (kpis.pendingCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const feeFormatted = (kpis.feeCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Filtragem de transações na tabela
  const filteredCharges = recentCharges.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (txFilter === 'todos') return true;
    if (txFilter === 'pix') return c.method === 'PIX';
    if (txFilter === 'cartao') return c.method === 'CREDIT_CARD';
    if (txFilter === 'boleto') return c.method === 'BOLETO';
    if (txFilter === 'pagas') return c.status === 'RECEIVED' || c.status === 'CONFIRMED';
    if (txFilter === 'pendentes') return c.status === 'PENDING' || c.status === 'OVERDUE';

    return true;
  });

  // Cálculo de coordenadas SVG para o gráfico dinâmico
  const maxChartVal = Math.max(...chartData.map((d) => d.total), 100);
  const chartPoints = chartData.map((d, index) => {
    const x = chartData.length > 1 ? (index / (chartData.length - 1)) * 740 : 370;
    const y = 160 - (d.total / maxChartVal) * 140;
    return `${x},${y}`;
  });
  const polylinePoints = chartPoints.join(' ');
  const polygonArea = `0,160 ${polylinePoints} 740,160`;

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
                <span className="font-label-sm text-label-sm font-semibold uppercase text-secondary">
                  Banco Central • NextPay IP S.A
                </span>
                <span className="text-outline text-xs">•</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Conta: {account?.account || '7342797-3'} (Agência {account?.agency || '0001'})
                </span>
              </div>
              <h2 className="font-title-md text-title-md text-on-surface font-semibold truncate mt-0.5">
                Liquidação Instantânea D+0 Ativa via Pix & Persistência em PostgreSQL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0">
            <button
              type="button"
              onClick={onOpenWithdraw}
              className="px-space-md py-2 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md font-semibold hover:opacity-95 transition-opacity flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Solicitar Saque Pix</span>
            </button>
          </div>
        </div>

        {/* 4 TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Saldo Disponível */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Saldo Disponível
              </span>
              <span className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  account_balance_wallet
                </span>
              </span>
            </div>
            <div className="my-space-sm">
              <span className="font-numeric-lg text-headline-md lg:text-headline-lg font-bold text-on-surface tracking-tight">
                {availableBalance}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span className="text-secondary flex items-center gap-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Pronto
                para saque
              </span>
              <button
                type="button"
                onClick={onOpenWithdraw}
                className="text-primary hover:underline text-xs font-semibold"
              >
                Transferir
              </button>
            </div>
          </div>

          {/* Card 2: Volume Total no Período */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Volume Total ({selectedPeriod}d)
              </span>
              <span className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </span>
            </div>
            <div className="my-space-sm">
              <span className="font-numeric-lg text-headline-md lg:text-headline-lg font-bold text-on-surface tracking-tight">
                {totalGrossFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>{kpis.totalCount} cobranças emitidas</span>
              <span className="text-secondary font-semibold">{kpis.countReceived} pagas</span>
            </div>
          </div>

          {/* Card 3: Recebido / Liquidado */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Recebido Liquidado
              </span>
              <span className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </span>
            </div>
            <div className="my-space-sm">
              <span className="font-numeric-lg text-headline-md lg:text-headline-lg font-bold text-secondary tracking-tight">
                {receivedFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Aguardando: {pendingFormatted}</span>
              <span className="text-outline text-xs">D+0 / D+32</span>
            </div>
          </div>

          {/* Card 4: Taxas Retidas NextPay */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Taxas & Spread Retidos
              </span>
              <span className="h-8 w-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[18px]">savings</span>
              </span>
            </div>
            <div className="my-space-sm">
              <span className="font-numeric-lg text-headline-md lg:text-headline-lg font-bold text-tertiary tracking-tight">
                {feeFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Transparência total</span>
              <span className="text-primary font-semibold">Zero anuidade</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: GRÁFICO DE FATURAMENTO + CONVERSÃO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Main Chart Column (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div>
                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                    Evolução Diária do Faturamento
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Valores apurados em tempo real das cobranças no PostgreSQL ({selectedPeriod}{' '}
                    dias)
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-surface-container">
                  {([30, 14, 7] as const).map((period) => (
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

              {/* Gráfico Dinâmico SVG */}
              <div className="h-56 w-full pt-space-md relative flex flex-col justify-end">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
                      progress_activity
                    </span>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
                    Sem dados no período selecionado
                  </div>
                ) : (
                  <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 740 180"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#006c49" stopOpacity="0.25"></stop>
                        <stop offset="100%" stopColor="#006c49" stopOpacity="0.0"></stop>
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

                    {/* Área preenchida */}
                    <polygon fill="url(#chartGradient)" points={polygonArea} />

                    {/* Linha principal */}
                    <polyline
                      fill="none"
                      stroke="#006c49"
                      strokeWidth="3"
                      points={polylinePoints}
                    />
                  </svg>
                )}

                {/* Eixo X com Labels */}
                <div className="flex justify-between pt-2 border-t border-surface-container text-[11px] text-outline font-mono">
                  {chartData
                    .filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0)
                    .map((d) => (
                      <span key={d.date}>{d.label}</span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Tiles (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div
              onClick={() => onNavigate('links')}
              className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-space-md group border border-surface-container/60"
            >
              <div className="h-12 w-12 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">link</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Links de Pagamento
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant truncate">
                  Gerencie vitrine e checkout online
                </p>
              </div>
              <span className="material-symbols-outlined text-outline ml-auto group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>

            <div
              onClick={() => onOpenQrPix('Cobrança Pix Dinâmica', 'R$ 450,00')}
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
              onClick={() => onNavigate('produtos')}
              className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-space-md group border border-surface-container/60"
            >
              <div className="h-12 w-12 rounded-lg bg-primary-container text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors font-semibold">
                  Catálogo de Produtos
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant truncate">
                  Serviços, cursos e assinaturas
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
        </div>

        {/* TABELA DE COBRANÇAS RECENTES */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container/60">
          <div className="p-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Extrato de Cobranças no Banco
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lançamentos reais persistidos na base PostgreSQL
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
                className="w-full bg-surface-container-low text-body-sm rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container text-on-surface"
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
                  <th className="py-3 px-space-md font-semibold text-right">Valor Bruto</th>
                  <th className="py-3 px-space-md font-semibold text-right">Taxa Cobrada</th>
                  <th className="py-3 px-space-md font-semibold text-right">Líquido Lojista</th>
                  <th className="py-3 px-space-lg font-semibold text-center">Status</th>
                  <th className="py-3 px-space-sm font-semibold text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      Carregando extrato...
                    </td>
                  </tr>
                ) : filteredCharges.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      Nenhuma cobrança encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCharges.map((c) => {
                    const gross = (c.amountCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    });
                    const fee = (c.feeCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    });
                    const net = (c.netCents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    });

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-space-md px-space-lg">
                          <div className="flex items-center gap-space-sm">
                            <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant font-label-md text-label-md">
                              {(c.customer?.name || 'CX').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-md text-body-md font-semibold text-on-surface">
                                {c.customer?.name || 'Cliente Avulso'}
                              </span>
                              <span className="font-body-sm text-body-sm text-outline">
                                {c.customer?.cpfCnpj || 'Documento não informado'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex flex-col">
                            <span className="text-on-surface font-medium">{c.description}</span>
                            <span className="font-label-sm text-label-sm text-outline font-mono">
                              #{c.id.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label-sm font-label-sm font-semibold ${
                              c.method === 'PIX'
                                ? 'bg-secondary-container/40 text-on-secondary-container'
                                : c.method === 'CREDIT_CARD'
                                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                  : 'bg-primary-fixed text-on-primary-fixed'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {c.method === 'PIX'
                                ? 'qr_code_2'
                                : c.method === 'CREDIT_CARD'
                                  ? 'credit_card'
                                  : 'receipt'}
                            </span>
                            <span>
                              {c.method === 'PIX'
                                ? 'Pix D+0'
                                : c.method === 'CREDIT_CARD'
                                  ? 'Cartão'
                                  : 'Boleto'}
                            </span>
                          </span>
                        </td>
                        <td className="py-space-md px-space-md text-right font-numeric-md font-bold text-on-surface">
                          {gross}
                        </td>
                        <td className="py-space-md px-space-md text-right font-numeric-md text-error font-medium">
                          - {fee}
                        </td>
                        <td className="py-space-md px-space-md text-right font-numeric-md font-bold text-secondary">
                          {net}
                        </td>
                        <td className="py-space-md px-space-lg text-center">
                          <span
                            className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-1 rounded-full font-semibold ${
                              c.status === 'RECEIVED' || c.status === 'CONFIRMED'
                                ? 'bg-secondary-container/50 text-on-secondary-container'
                                : c.status === 'PENDING'
                                  ? 'bg-warning-container/40 text-on-warning-container'
                                  : 'bg-error-container/40 text-on-error-container'
                            }`}
                          >
                            {c.status === 'RECEIVED'
                              ? 'Liquidado'
                              : c.status === 'CONFIRMED'
                                ? 'Confirmado'
                                : c.status === 'PENDING'
                                  ? 'Aguardando'
                                  : 'Vencido'}
                          </span>
                        </td>
                        <td className="py-space-md px-space-sm text-center">
                          <button
                            type="button"
                            onClick={() => onOpenReceipt(c)}
                            className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                            title="Ver Comprovante"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              receipt_long
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
