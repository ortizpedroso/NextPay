import React, { useState } from 'react';

interface SubscriptionsViewProps {
  onShowToast: (msg: string) => void;
  onNavigate: (view: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  onShowToast,
  onNavigate,
}) => {
  const [filterState, setFilterState] = useState<'all' | 'active' | 'overdue'>('all');

  const subscriptionPlans = [
    {
      id: 'sub-1',
      title: 'Mentoria & Acompanhamento Trimestral',
      cadence: 'Trimestral (Cobrança a cada 3 meses)',
      price: 'R$ 380,00/mês',
      activeSubscribers: 39,
      mrr: 'R$ 14.820,00',
      churnRate: '1.2%',
    },
    {
      id: 'sub-2',
      title: 'Consultoria Design UX/UI Contínua',
      cadence: 'Mensal (Renovação automática no cartão)',
      price: 'R$ 1.500,00/mês',
      activeSubscribers: 14,
      mrr: 'R$ 21.000,00',
      churnRate: '0.0%',
    },
    {
      id: 'sub-3',
      title: 'Suporte & Manutenção Cloud / Servidor',
      cadence: 'Mensal com Débito Automático',
      price: 'R$ 850,00/mês',
      activeSubscribers: 8,
      mrr: 'R$ 6.800,00',
      churnRate: '2.5%',
    },
  ];

  const subscribers = [
    {
      id: 'usr-1',
      name: 'Mariana Albuquerque',
      plan: 'Consultoria UX/UI Contínua',
      method: 'Cartão de Crédito',
      status: 'Ativa',
      nextBilling: '18/10/2026',
      totalPaid: 'R$ 9.000,00',
    },
    {
      id: 'usr-2',
      name: 'Lucas Oliveira • Studio',
      plan: 'Suporte & Manutenção Cloud',
      method: 'Boleto Recorrente',
      status: 'Ativa',
      nextBilling: '22/10/2026',
      totalPaid: 'R$ 5.100,00',
    },
    {
      id: 'usr-3',
      name: 'TechVenture Capital',
      plan: 'Mentoria & Acompanhamento Trimestral',
      method: 'Cartão de Crédito',
      status: 'Ativa',
      nextBilling: '04/11/2026',
      totalPaid: 'R$ 4.560,00',
    },
    {
      id: 'usr-4',
      name: 'Agência Polaris Mídia',
      plan: 'Consultoria UX/UI Contínua',
      method: 'Boleto CIP',
      status: 'Pendente',
      nextBilling: 'Atrasado (3 dias)',
      totalPaid: 'R$ 3.000,00',
    },
  ];

  const filteredSubscribers = subscribers.filter((sub) => {
    if (filterState === 'all') return true;
    if (filterState === 'active') return sub.status === 'Ativa';
    if (filterState === 'overdue') return sub.status === 'Pendente';
    return true;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
        {/* Top Header */}
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

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              MRR Ativo (Mensal)
            </span>
            <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1 font-bold">
              R$ 42.620,00
            </div>
            <span className="font-body-sm text-secondary flex items-center gap-1 mt-0.5 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +8.5% este
              mês
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Assinantes Ativos
            </span>
            <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1 font-bold">
              61 clientes
            </div>
            <span className="font-body-sm text-on-surface-variant mt-0.5 block">
              100% com renovação automática
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Taxa de Retenção
            </span>
            <div className="font-numeric-lg text-numeric-lg text-secondary mt-1 font-bold">
              98.8%
            </div>
            <span className="font-body-sm text-secondary mt-0.5 block font-medium">
              Churn extremamente baixo (1.2%)
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
              Retentativas inteligentes de saldo
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Planos Ativos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
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
                    {plan.title}
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">{plan.cadence}</p>

                  <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-surface-container/60 space-y-1">
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">Valor:</span>
                      <span className="font-bold text-on-surface">{plan.price}</span>
                    </div>
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">Assinantes:</span>
                      <span className="font-bold text-secondary">
                        {plan.activeSubscribers} ativos
                      </span>
                    </div>
                    <div className="flex justify-between text-body-sm">
                      <span className="text-on-surface-variant">MRR Total:</span>
                      <span className="font-bold text-primary">{plan.mrr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-surface-container/60">
                  <button
                    type="button"
                    onClick={() => onShowToast(`Link da assinatura "${plan.title}" copiado!`)}
                    className="flex-1 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <span>Copiar Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast(`Gerenciamento do plano "${plan.title}" aberto`)}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold transition-colors"
                  >
                    Gerenciar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribers Table */}
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
                Todos (61)
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
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-container-low/50">
                    <td className="py-3 px-4 font-semibold text-on-surface">{sub.name}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{sub.plan}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{sub.method}</td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        sub.status === 'Pendente' ? 'text-error' : 'text-on-surface'
                      }`}
                    >
                      {sub.nextBilling}
                    </td>
                    <td className="py-3 px-4 text-right font-numeric-md font-bold text-on-surface">
                      {sub.totalPaid}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          sub.status === 'Ativa'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.status === 'Ativa' ? 'bg-secondary' : 'bg-error animate-pulse'
                          }`}
                        ></span>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onShowToast(`Lembrete e extrato reenviados para ${sub.name}`)
                        }
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Gerenciar
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
