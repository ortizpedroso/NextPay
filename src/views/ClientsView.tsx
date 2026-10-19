import React, { useState } from 'react';

import type { ClientRow } from '../data/mockData';
import { createMerchantCustomer } from '../lib/api/adminOperations';
import { hasDashboardSession } from '../lib/api/dashboardAuth';

interface ClientsViewProps {
  clients: ClientRow[];
  onShowToast: (msg: string) => void;
  onClientCreated?: () => void;
  onOpenNewChargeForClient: (clientName: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onShowToast,
  onClientCreated,
  onOpenNewChargeForClient,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredClients = clients.filter((cli) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cli.name.toLowerCase().includes(q) ||
      cli.email.toLowerCase().includes(q) ||
      cli.cpfCnpj.includes(q)
    );
  });

  const handleCreateClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasDashboardSession()) {
      onShowToast('Faça login no painel para cadastrar clientes.');
      return;
    }
    if (!name.trim() || !email.trim() || document.trim().length < 11) {
      onShowToast('Preencha nome, e-mail e CPF/CNPJ válido.');
      return;
    }
    setIsSaving(true);
    try {
      await createMerchantCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        document: document.replace(/\D/g, ''),
      });
      onShowToast('Cliente cadastrado com sucesso.');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setDocument('');
      onClientCreated?.();
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Falha ao cadastrar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-body-sm shadow-sm hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Novo Cliente</span>
          </button>
        </div>

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
              {clients.length > 0 ? `${clients.length} na base` : 'Nenhum ainda'}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">
              Base de Clientes NextPay
            </span>
            <div className="font-numeric-lg text-headline-sm font-bold text-primary mt-1">
              {hasDashboardSession() ? 'Sincronizado' : 'Demo local'}
            </div>
          </div>
        </div>

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

          <div className="divide-y divide-surface-container/80">
            {filteredClients.map((client) => (
              <div
                key={client.email}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-on-surface">{client.name}</p>
                  <p className="text-body-sm text-outline">
                    {client.email} • {client.cpfCnpj}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenNewChargeForClient(client.name)}
                  className="text-primary font-semibold text-body-sm hover:underline"
                >
                  Nova cobrança
                </button>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <p className="py-6 text-center text-outline text-body-sm">
                Nenhum cliente encontrado. Cadastre o primeiro pagador.
              </p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <form
            onSubmit={handleCreateClient}
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-space-lg w-full max-w-md space-y-4"
          >
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Novo cliente</h2>
            <label className="block space-y-1">
              <span className="text-label-sm text-outline">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-surface-container px-3 py-2 bg-surface-container-low"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-label-sm text-outline">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-surface-container px-3 py-2 bg-surface-container-low"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-label-sm text-outline">CPF/CNPJ</span>
              <input
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full rounded-lg border border-surface-container px-3 py-2 bg-surface-container-low"
                required
              />
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-outline hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold disabled:opacity-60"
              >
                {isSaving ? 'Salvando…' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
