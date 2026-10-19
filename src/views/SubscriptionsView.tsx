import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { formatBRL } from '../lib/format';
import { hasDashboardSession } from '../lib/api/dashboardAuth';
import {
  fetchSubscriptionMetrics,
  fetchSubscriptionPlans,
  fetchSubscriptions,
  type SubscriptionDto,
  type SubscriptionMetricsDto,
  type SubscriptionPlanSummaryDto,
} from '../lib/api/subscriptions';

interface SubscriptionsViewProps {
  onShowToast: (msg: string) => void;
  onNavigate: (view: string) => void;
}

function formatBillingDate(iso: string, status: SubscriptionDto['status']): string {
  if (status === 'OVERDUE') {
    return 'Atrasado';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('pt-BR');
}

function statusLabel(status: SubscriptionDto['status']): string {
  if (status === 'ACTIVE') {
    return 'Ativa';
  }
  if (status === 'OVERDUE') {
    return 'Pendente';
  }
  return 'Cancelada';
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  onShowToast,
  onNavigate,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'active' | 'overdue'>('all');
  const [plans, setPlans] = useState<SubscriptionPlanSummaryDto[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriptionDto[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetricsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!hasDashboardSession()) {
      setPlans([]);
      setSubscribers([]);
      setMetrics(null);
      return;
    }
    setIsLoading(true);
    try {
      const [planRows, subscriptionRows, metricRows] = await Promise.all([
        fetchSubscriptionPlans(),
        fetchSubscriptions(),
        fetchSubscriptionMetrics(),
      ]);
      setPlans(planRows);
      setSubscribers(subscriptionRows);
      setMetrics(metricRows);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Erro ao carregar assinaturas.');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      if (filterState === 'all') {
        return sub.status !== 'CANCELED';
      }
      if (filterState === 'active') {
        return sub.status === 'ACTIVE';
      }
      if (filterState === 'overdue') {
        return sub.status === 'OVERDUE';
      }
      return true;
    });
  }, [subscribers, filterState]);

  const activeCount = metrics?.activeSubscribers ?? 0;
  const overdueCount = metrics?.overdueSubscribers ?? 0;
  const mrrCents = metrics?.mrrCents ?? 0;
  const retention = metrics?.retentionPercent ?? 100;

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-semibold">
                NextPay Recorrência
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Motor de MRR & Assinaturas
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
              Gestão de Assinaturas & Planos Recorrentes
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Cobrança automatizada no cartão ou boleto sem necessidade de reemissão manual.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => onNavigate('produtos-e-servicos')}
              className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-label-md text-label-md font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Novo Plano de Assinatura</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              MRR Ativo (Mensal)
            </span>
            <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1 font-bold">
              {formatBRL(mrrCents)}
            </div>
            <span className="font-body-sm text-secondary flex items-center gap-1 mt-0.5 font-medium">
              {isLoading ? 'Atualizando…' : 'Dados do painel'}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Assinantes Ativos
            </span>
            <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1 font-bold">
              {activeCount} clientes
            </div>
            <span className="font-body-sm text-on-surface-variant mt-0.5 block">
              {overdueCount > 0 ? `${overdueCount} inadimplente(s)` : 'Renovação automática'}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Taxa de Retenção
            </span>
            <div className="font-numeric-lg text-numeric-lg text-secondary mt-1 font-bold">
              {retention.toFixed(1)}%
            </div>
            <span className="font-body-sm text-secondary mt-0.5 block font-medium">
              Com base nas assinaturas cadastradas
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Cobranças de Régua Ativa
            </span>
            <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1 font-bold">
              Automático
            </div>
            <span className="font-body-sm text-outline mt-0.5 block">
              Job `process-renewals` (API)
            </span>
          </div>
        </div>

        <div className="space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Planos Ativos</h2>
          {plans.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">
              Nenhum plano com assinantes ainda. Cadastre produtos recorrentes e assinaturas pela
              API.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {plans.map((plan) => (
                <div
                  key={`${plan.productPublicId ?? 'plan'}:${plan.planTitle}`}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold uppercase">
                        Recorrência
                      </span>
                      <span className="text-secondary font-label-sm text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Ativo
                      </span>
                    </div>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface mt-2">
                      {plan.planTitle}
                    </h3>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">{plan.cadenceLabel}</p>

                    <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-surface-container/60 space-y-1">
                      <div className="flex justify-between text-body-sm">
                        <span className="text-on-surface-variant">Valor:</span>
                        <span className="font-bold text-on-surface">
                          {formatBRL(plan.priceCents)}/mês
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="text-on-surface-variant">Assinantes:</span>
                        <span className="font-bold text-secondary">
                          {plan.activeSubscribers} ativos
                        </span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="text-on-surface-variant">MRR Total:</span>
                        <span className="font-bold text-primary">{formatBRL(plan.mrrCents)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-surface-container/60">
                    <button
                      type="button"
                      onClick={() => {
                        const slug = plan.productPublicId ?? plan.planTitle;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`https://nextpay.link/assinatura/${slug}`);
                        }
                        onShowToast(`Link da assinatura "${plan.planTitle}" copiado!`);
                      }}
                      className="flex-1 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      <span>Copiar Link</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden space-y-4 p-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Assinantes Cadastrados
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Clientes com ciclo de cobrança recorrente ativo
              </p>
            </div>

            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container">
              <button
                type="button"
                onClick={() => setFilterState('all')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  filterState === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                Todos ({activeCount + overdueCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterState('active')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  filterState === 'active'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                Ativas
              </button>
              <button
                type="button"
                onClick={() => setFilterState('overdue')}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  filterState === 'overdue'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant'
                }`}
              >
                Inadimplentes
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-label-sm uppercase text-outline">
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Plano</th>
                  <th className="py-3 px-4 font-semibold">Forma de Pagamento</th>
                  <th className="py-3 px-4 font-semibold">Próxima Renovação</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Acumulado</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-on-surface-variant">
                      {hasDashboardSession()
                        ? 'Nenhuma assinatura cadastrada.'
                        : 'Faça login para ver assinaturas.'}
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => {
                    const label = statusLabel(sub.status);
                    const isOverdue = sub.status === 'OVERDUE';
                    return (
                      <tr key={sub.subscriptionPublicId} className="hover:bg-surface-container-low/50">
                        <td className="py-3 px-4 font-semibold text-on-surface">{sub.customerName}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{sub.planTitle}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{sub.paymentMethod}</td>
                        <td
                          className={`py-3 px-4 font-medium ${
                            isOverdue ? 'text-error' : 'text-on-surface'
                          }`}
                        >
                          {formatBillingDate(sub.nextBillingAt, sub.status)}
                        </td>
                        <td className="py-3 px-4 text-right font-numeric-md font-bold text-on-surface">
                          {formatBRL(sub.totalPaidCents)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                              sub.status === 'ACTIVE'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === 'ACTIVE' ? 'bg-secondary' : 'bg-error animate-pulse'
                              }`}
                            ></span>
                            {label}
                          </span>
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
