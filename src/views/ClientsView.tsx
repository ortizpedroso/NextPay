import React, { useState } from 'react';
import type { ClientRow } from '../data/mockData';

interface ClientsViewProps {
  clients: ClientRow[];
  onShowToast: (msg: string) => void;
  onOpenNewChargeForClient: (clientName: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  _onShowToast,
  onOpenNewChargeForClient,
}: ClientsViewProps & { _onShowToast?: (msg: string) => void }) => {
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter((cli) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cli.name.toLowerCase().includes(q) ||
      cli.email.toLowerCase().includes(q) ||
      cli.cpfCnpj.includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
                NextPay CRM
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Base de Pagadores
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
              Meus Clientes
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Gerencie cadastros, histórico de faturas e cobranças automáticas para sua base.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Em breve"
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant/70 cursor-not-allowed font-semibold text-body-sm shadow-none opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Novo Cliente</span>
            <span className="ml-1 text-[10px] font-bold uppercase bg-surface-container-highest px-1.5 py-0.5 rounded text-outline">
              Em breve
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">Total de Clientes</span>
            <div className="font-numeric-lg text-headline-sm font-bold text-on-surface mt-1">
              {clients.length} cadastrados
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">
              Clientes com Cobranças Ativas
            </span>
            <div className="font-numeric-lg text-headline-sm font-bold text-secondary mt-1">
              100% em dia
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">
              Base de Clientes NextPay
            </span>
            <div className="font-numeric-lg text-headline-sm font-bold text-primary mt-1">
              Sincronizado
            </div>
          </div>
        </div>

        {/* Search & List */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 p-space-md space-y-4">
          <div className="flex items-center gap-2 max-w-md bg-surface-container-low px-3 py-2 rounded-lg border border-surface-container">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full text-body-sm outline-none placeholder:text-outline"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-label-sm uppercase text-outline">
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">CPF / CNPJ</th>
                  <th className="py-3 px-4 font-semibold">Contato</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Faturado</th>
                  <th className="py-3 px-4 font-semibold text-center">Cobranças</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{c.name}</div>
                      <div className="text-xs text-outline">{c.city}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">
                      {c.cpfCnpj}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-on-surface">{c.email}</div>
                      <div className="text-xs text-outline">{c.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-numeric-md font-bold text-on-surface">
                      {c.totalBilled}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-semibold">
                        {c.chargesCount} cobranças
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenNewChargeForClient(c.name)}
                        className="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors"
                      >
                        Cobrar
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
