import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, PaymentLinkData } from '../api/client';

interface PaymentLinksViewProps {
  onOpenQrPix: (title: string, price: string) => void;
  onOpenCheckoutWithLink: (link: PaymentLinkData) => void;
  onShowToast: (msg: string) => void;
}

export const PaymentLinksView: React.FC<PaymentLinksViewProps> = ({
  onOpenQrPix,
  onOpenCheckoutWithLink,
  onShowToast,
}) => {
  const queryClient = useQueryClient();

  // Generator state
  const [billingType, setBillingType] = useState<'avulsa' | 'recorrente'>('avulsa');
  const [title, setTitle] = useState('Consultoria de Design UX/UI - Pacote Mensal');
  const [amount, setAmount] = useState('1500,00');
  const [enablePix, setEnablePix] = useState(true);
  const [enableCard, setEnableCard] = useState(true);
  const [enableBoleto, setEnableBoleto] = useState(true);
  const [maxInstallments, setMaxInstallments] = useState('12');
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);

  // Link filter state
  const [linkFilter, setLinkFilter] = useState<'all' | 'recorrente' | 'avulsa'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Calculate net pix estimate using new NextPay rate (R$ 2,48 fixo por cobrança)
  const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
  const pixFeeCharged = 2.48;
  const netPix = Math.max(0, numericAmount - pixFeeCharged);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payment-links', { page, pageSize, q: search, type: linkFilter }],
    queryFn: () =>
      api.getPaymentLinks({
        page,
        pageSize,
        q: search,
        type: linkFilter !== 'all' ? linkFilter : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newLink: Partial<PaymentLinkData>) => api.createPaymentLink(newLink),
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      onShowToast(`Link "${link.title}" criado e ativo para cobrança!`);
      setTitle('');
      setAmount('0,00');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao criar link: ${err.message}`);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.togglePaymentLink(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      onShowToast(`Link "${updated.title}" ${updated.active ? 'ativado' : 'pausado'} com sucesso!`);
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao alterar status: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePaymentLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-links'] });
      onShowToast('Link de pagamento excluído com sucesso!');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao excluir link: ${err.message}`);
    },
  });

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numericAmount <= 0) {
      onShowToast('Informe o nome e valor da cobrança.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: `${billingType === 'recorrente' ? 'Assinatura recorrente' : 'Pagamento único'} via Pix e Cartão`,
      amountCents: Math.round(numericAmount * 100),
      billingType,
      active: true,
      maxInstallments: parseInt(maxInstallments, 10) || 12,
      enablePix,
      enableCard,
      enableBoleto,
    });
  };

  const handleCopyLink = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    onShowToast('Link de pagamento copiado para a área de transferência!');
  };

  const paymentLinks = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-xl max-w-[1540px] mx-auto w-full">
        {/* Top Level Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest bg-surface-container-high px-space-sm py-0.5 rounded-full font-semibold">
                NextPay Checkout
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                Persistência em PostgreSQL
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
              Links de Pagamento & Cobranças
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Emita links instantâneos para WhatsApp, redes ou propostas comerciais. Gerencie status
              e receba via Pix, Cartão ou Boleto.
            </p>
          </div>
        </header>

        {/* SECTION: Gerador de Links de Cobrança */}
        <section className="bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-3xl shadow-sm border border-surface-container/60 space-y-space-lg">
          <div className="border-b border-surface-container pb-space-md">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">add_link</span>
              <span>Criar Novo Link de Pagamento</span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Preencha os dados e gere um link de checkout pronto para compartilhar com seu cliente.
            </p>
          </div>

          <form onSubmit={handleCreateLink} className="space-y-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* Left Column (7 cols): Dados da Cobrança */}
              <div className="lg:col-span-7 space-y-space-md">
                {/* Tipo de Cobrança */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                    Tipo de Cobrança
                  </label>
                  <div className="grid grid-cols-2 gap-space-xs p-1 bg-surface-container-low rounded-xl border border-surface-container">
                    <button
                      type="button"
                      onClick={() => setBillingType('avulsa')}
                      className={`py-2 text-center rounded-lg font-title-md text-body-md font-medium transition-all ${
                        billingType === 'avulsa'
                          ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Cobrança Avulsa
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingType('recorrente')}
                      className={`py-2 text-center rounded-lg font-title-md text-body-md font-medium transition-all ${
                        billingType === 'recorrente'
                          ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Assinatura Recorrente
                    </button>
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                    Nome do Produto ou Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Consultoria em Branding & Identidade Visual"
                    className="w-full px-space-md py-3 rounded-xl bg-surface-container-low border border-surface-container text-body-md text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                    Valor a Cobrar (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 font-numeric-md font-bold text-on-surface-variant text-body-md">
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-12 pr-space-md py-3 rounded-xl bg-surface-container-low border border-surface-container text-title-md font-numeric-lg font-bold text-on-surface outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Estimativa líquida no Pix NextPay: R${' '}
                    {netPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Formas de Pagamento Aceitas */}
                <div className="space-y-2 pt-2">
                  <label className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                    Meios de Pagamento Disponíveis no Checkout
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        enablePix
                          ? 'bg-secondary/10 border-secondary text-on-surface'
                          : 'bg-surface-container-low border-surface-container text-outline'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enablePix}
                        onChange={(e) => setEnablePix(e.target.checked)}
                        className="rounded text-secondary"
                      />
                      <span className="text-xs font-semibold">Pix Instantâneo</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        enableCard
                          ? 'bg-primary/10 border-primary text-on-surface'
                          : 'bg-surface-container-low border-surface-container text-outline'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enableCard}
                        onChange={(e) => setEnableCard(e.target.checked)}
                        className="rounded text-primary"
                      />
                      <span className="text-xs font-semibold">Cartão de Crédito</span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        enableBoleto
                          ? 'bg-tertiary/10 border-tertiary text-on-surface'
                          : 'bg-surface-container-low border-surface-container text-outline'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enableBoleto}
                        onChange={(e) => setEnableBoleto(e.target.checked)}
                        className="rounded text-tertiary"
                      />
                      <span className="text-xs font-semibold">Boleto Bancário</span>
                    </label>
                  </div>
                </div>

                {/* Parcelamento */}
                {enableCard && (
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                      Parcelamento Máximo no Cartão
                    </label>
                    <select
                      value={maxInstallments}
                      onChange={(e) => setMaxInstallments(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-surface-container rounded-xl text-body-sm text-on-surface outline-none"
                    >
                      <option value="1">1x (Apenas à vista)</option>
                      <option value="3">Até 3x</option>
                      <option value="6">Até 6x</option>
                      <option value="12">Até 12x</option>
                      <option value="21">Até 21x</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Right Column (5 cols): Régua de Cobrança & Submit */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-space-md">
                <div className="bg-surface-container-low/70 p-space-md rounded-2xl space-y-space-md border border-surface-container">
                  <div className="flex items-center gap-space-xs text-primary">
                    <span className="material-symbols-outlined text-[20px]">
                      notifications_active
                    </span>
                    <span className="font-title-md text-title-md font-bold text-on-surface">
                      Régua de Notificações
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer">
                      <span className="text-body-sm text-on-surface">Notificações WhatsApp</span>
                      <input
                        type="checkbox"
                        checked={enableWhatsapp}
                        onChange={(e) => setEnableWhatsapp(e.target.checked)}
                        className="rounded text-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-surface-container cursor-pointer">
                      <span className="text-body-sm text-on-surface">Notificações por E-mail</span>
                      <input
                        type="checkbox"
                        checked={enableEmail}
                        onChange={(e) => setEnableEmail(e.target.checked)}
                        className="rounded text-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full py-3.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-title-md text-body-md font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>
                      {createMutation.isPending ? 'Criando Link...' : 'Gerar e Ativar Link'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* SECTION: Links Ativos */}
        <section className="space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Links Ativos & Vitrine de Pagamento
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Links gerenciados com estatísticas reais persistidas no PostgreSQL.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Buscar link..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs border border-surface-container text-on-surface outline-none"
              />
              <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setLinkFilter('all');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    linkFilter === 'all'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkFilter('recorrente');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    linkFilter === 'recorrente'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Recorrentes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkFilter('avulsa');
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    linkFilter === 'avulsa'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                      : 'text-on-surface-variant'
                  }`}
                >
                  Avulsos
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-on-surface-variant flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
                progress_activity
              </span>
              <p className="font-body-md text-body-md">Carregando links de pagamento...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center text-error bg-error-container/20 rounded-xl p-4">
              <p className="font-semibold">Erro ao carregar links:</p>
              <p className="text-sm">{(error as Error)?.message || 'Erro desconhecido'}</p>
            </div>
          ) : paymentLinks.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant flex flex-col items-center gap-3 bg-surface-container-lowest rounded-xl border border-surface-container/60 p-8">
              <span className="material-symbols-outlined text-[48px] text-outline">link_off</span>
              <p className="font-body-lg font-semibold text-on-surface">Nenhum link encontrado</p>
              <p className="text-body-sm max-w-md text-on-surface-variant">
                Crie um link de pagamento utilizando o formulário acima.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {paymentLinks.map((link) => {
                  const unitPriceFormatted = (link.amountCents / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  });
                  const url = `https://nextpay.link/silva-design/${link.slug}`;

                  return (
                    <article
                      key={link.id}
                      className={`bg-surface-container-lowest p-space-md rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-space-md border ${
                        link.active
                          ? 'border-surface-container/60 hover:shadow-md'
                          : 'border-surface-container/30 opacity-70 bg-surface-container-low/40'
                      }`}
                    >
                      <div className="space-y-space-sm">
                        <div className="flex items-start justify-between gap-space-sm">
                          <span
                            className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold uppercase ${
                              link.billingType === 'recorrente'
                                ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                                : 'bg-primary-fixed text-on-primary-fixed'
                            }`}
                          >
                            {link.billingType === 'recorrente'
                              ? 'Recorrente Mensal'
                              : 'Cobrança Avulsa'}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-body-sm text-body-sm font-semibold ${
                              link.active ? 'text-secondary' : 'text-outline'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${link.active ? 'bg-secondary' : 'bg-outline'}`}
                            ></span>
                            {link.active ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                            {link.title}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                            {link.description || 'Checkout Transparente NextPay'}
                          </p>
                        </div>

                        <div className="bg-surface-container-low p-space-sm rounded-xl space-y-1 border border-surface-container/60">
                          <div className="flex items-center justify-between text-body-sm">
                            <span className="text-on-surface-variant">Valor unitário:</span>
                            <span className="font-numeric-md font-bold text-on-surface">
                              {unitPriceFormatted}
                              {link.billingType === 'recorrente' ? '/mês' : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-body-sm">
                            <span className="text-on-surface-variant">Vendas registradas:</span>
                            <span className="font-numeric-md font-bold text-secondary">
                              {link.sales} {link.sales === 1 ? 'venda' : 'vendas'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-center pt-1 font-body-sm">
                          <div className="bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container">
                            <div className="font-numeric-md font-semibold text-on-surface">
                              {link.views}
                            </div>
                            <span className="text-[10px] text-outline uppercase font-semibold">
                              Acessos
                            </span>
                          </div>
                          <div className="bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container">
                            <div className="font-numeric-md font-semibold text-secondary">
                              {link.views > 0
                                ? ((link.sales / link.views) * 100).toFixed(1)
                                : '0.0'}
                              %
                            </div>
                            <span className="text-[10px] text-outline uppercase font-semibold">
                              Conversão
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-surface-container space-y-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(url)}
                            className="flex-1 py-1.5 px-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              content_copy
                            </span>
                            <span>Copiar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCheckoutWithLink(link)}
                            className="flex-1 py-1.5 px-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              shopping_cart
                            </span>
                            <span>Checkout</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenQrPix(link.title, unitPriceFormatted)}
                            className="p-1.5 hover:bg-surface-container text-secondary rounded-lg transition-colors"
                            title="Ver QR Code Pix"
                          >
                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleMutation.mutate(link.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              link.active
                                ? 'hover:bg-warning-container/20 text-warning'
                                : 'hover:bg-secondary-container/20 text-secondary'
                            }`}
                            title={link.active ? 'Pausar Link' : 'Ativar Link'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {link.active ? 'pause_circle' : 'play_circle'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Deseja excluir o link "${link.title}"?`)) {
                                deleteMutation.mutate(link.id);
                              }
                            }}
                            className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors"
                            title="Excluir Link"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Paginação Real */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-container text-body-sm text-on-surface-variant">
                <span>
                  Mostrando {paymentLinks.length} de {total} links cadastrados
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
        </section>
      </div>
    </div>
  );
};
