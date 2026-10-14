import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CustomerData } from '../api/client';

interface ClientsViewProps {
  onShowToast: (msg: string) => void;
  onOpenNewChargeForClient: (clientName: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onShowToast,
  onOpenNewChargeForClient,
}) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal Novo / Editar Cliente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomerData | null>(null);
  const [formName, setFormName] = useState('');
  const [formCpfCnpj, setFormCpfCnpj] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', { page, pageSize, q: search }],
    queryFn: () => api.getCustomers({ page, pageSize, q: search }),
  });

  const createMutation = useMutation({
    mutationFn: (newCustomer: Partial<CustomerData>) => api.createCustomer(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
      onShowToast('Cliente cadastrado com sucesso no NextPay!');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao salvar cliente: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerData> }) =>
      api.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      resetForm();
      onShowToast('Dados do cliente atualizados com sucesso!');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao atualizar cliente: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onShowToast('Cliente excluído com sucesso!');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao excluir cliente: ${err.message}`);
    },
  });

  const resetForm = () => {
    setEditingClient(null);
    setFormName('');
    setFormCpfCnpj('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormState('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CustomerData) => {
    setEditingClient(c);
    setFormName(c.name);
    setFormCpfCnpj(c.cpfCnpj);
    setFormEmail(c.email);
    setFormPhone(c.phone || '');
    setFormCity(c.city || '');
    setFormState(c.state || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCpfCnpj.trim() || !formEmail.trim()) {
      onShowToast('Preencha os campos obrigatórios (Nome, CPF/CNPJ e E-mail).');
      return;
    }

    if (editingClient) {
      updateMutation.mutate({
        id: editingClient.id,
        data: {
          name: formName.trim(),
          cpfCnpj: formCpfCnpj.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim() || null,
          city: formCity.trim() || null,
          state: formState.trim() || null,
        },
      });
    } else {
      createMutation.mutate({
        name: formName.trim(),
        cpfCnpj: formCpfCnpj.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        city: formCity.trim() || null,
        state: formState.trim() || null,
      });
    }
  };

  const clients = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-body-sm shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">Total de Clientes</span>
            <div className="font-numeric-lg text-headline-sm font-bold text-on-surface mt-1">
              {total} cadastrados
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">
              Base de Clientes NextPay
            </span>
            <div className="font-numeric-lg text-headline-sm font-bold text-secondary mt-1">
              Persistido em Banco PostgreSQL
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <span className="text-xs uppercase font-semibold text-outline">Status da Conexão</span>
            <div className="font-numeric-lg text-headline-sm font-bold text-primary mt-1">
              Sincronizado via REST API
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-transparent w-full text-body-sm outline-none placeholder:text-outline text-on-surface"
            />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
                progress_activity
              </span>
              <p className="font-body-md text-body-md">Carregando clientes do banco de dados...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-error bg-error-container/20 rounded-xl p-4">
              <p className="font-semibold">Erro ao carregar clientes:</p>
              <p className="text-sm">{(error as Error)?.message || 'Erro desconhecido'}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">person_off</span>
              <p className="font-body-lg font-semibold text-on-surface">
                Nenhum cliente encontrado
              </p>
              <p className="text-body-sm max-w-md text-on-surface-variant">
                {search
                  ? 'Nenhum resultado para os termos pesquisados.'
                  : 'Cadastre seu primeiro cliente para gerar faturas e links nominais.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container"
              >
                Cadastrar Cliente
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-label-sm uppercase text-outline">
                      <th className="py-3 px-4 font-semibold">Cliente</th>
                      <th className="py-3 px-4 font-semibold">CPF / CNPJ</th>
                      <th className="py-3 px-4 font-semibold">Contato</th>
                      <th className="py-3 px-4 font-semibold text-center">Cobranças</th>
                      <th className="py-3 px-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {clients.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-on-surface">{c.name}</div>
                          <div className="text-xs text-outline">
                            {c.city && c.state ? `${c.city} - ${c.state}` : c.city || 'Brasil'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">
                          {c.cpfCnpj}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-on-surface">{c.email}</div>
                          <div className="text-xs text-outline">{c.phone || 'Sem telefone'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface">
                            {c._count?.charges || 0} faturas
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenNewChargeForClient(c.name)}
                              className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors"
                            >
                              Cobrar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="p-1 hover:bg-surface-container text-on-surface-variant rounded transition-colors"
                              title="Editar Cliente"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja excluir o cliente "${c.name}"?`)) {
                                  deleteMutation.mutate(c.id);
                                }
                              }}
                              className="p-1 hover:bg-error-container/20 text-error rounded transition-colors"
                              title="Excluir Cliente"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação Real */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container text-body-sm text-on-surface-variant">
                <span>
                  Mostrando {clients.length} de {total} clientes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-on-surface"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-semibold text-on-surface">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-on-surface"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Criar / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg text-title-lg font-bold text-on-surface">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Mariana Albuquerque"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                    CPF ou CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCpfCnpj}
                    onChange={(e) => setFormCpfCnpj(e.target.value)}
                    placeholder="123.456.789-00"
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(11) 98822-1092"
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="cliente@exemplo.com.br"
                  className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm uppercase font-semibold text-on-surface-variant mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-3 py-2 bg-surface-container-low rounded-lg border border-surface-container text-body-sm text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Salvando...'
                    : editingClient
                      ? 'Salvar Alterações'
                      : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
