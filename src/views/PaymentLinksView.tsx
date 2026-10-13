import React, { useState } from 'react';
import { PaymentLink, Transaction, FEE_TABLE } from '../data/mockData';

interface PaymentLinksViewProps {
  paymentLinks: PaymentLink[];
  transactions: Transaction[];
  onAddPaymentLink: (newLink: PaymentLink) => void;
  onOpenQrPix: (title: string, price: string) => void;
  onOpenReceipt: (tx?: Transaction) => void;
  onOpenCheckoutWithLink: (link: PaymentLink) => void;
  onShowToast: (msg: string) => void;
}

export const PaymentLinksView: React.FC<PaymentLinksViewProps> = ({
  paymentLinks,
  transactions,
  onAddPaymentLink,
  onOpenQrPix,
  onOpenReceipt,
  onOpenCheckoutWithLink,
  onShowToast,
}) => {
  // Generator state
  const [billingType, setBillingType] = useState<'avulsa' | 'recorrente'>('avulsa');
  const [title, setTitle] = useState('Consultoria de Design UX/UI - Pacote Mensal');
  const [amount, setAmount] = useState('1500,00');
  const [dueDate, setDueDate] = useState('2025-04-10');
  const [enablePix, setEnablePix] = useState(true);
  const [enableCard, setEnableCard] = useState(true);
  const [enableBoleto, setEnableBoleto] = useState(true);
  const [maxInstallments, setMaxInstallments] = useState('12x');
  const [feeBearer, setFeeBearer] = useState<'client' | 'seller'>('client');
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);

  // Link filter state
  const [linkFilter, setLinkFilter] = useState<'all' | 'recorrente' | 'avulsa'>('all');
  const [searchTable, setSearchTable] = useState('');

  // Calculate net pix estimate using new NextPay rate (R$ 2,48 fixo por cobrança)
  const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
  const pixFeeCharged = 2.48;
  const netPix = Math.max(0, numericAmount - pixFeeCharged);

  const filteredLinks = paymentLinks.filter((link) => {
    if (linkFilter === 'all') return true;
    return link.type === linkFilter;
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTable) return true;
    const q = searchTable.toLowerCase();
    return (
      tx.clientName.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.code.toLowerCase().includes(q)
    );
  });

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numericAmount <= 0) {
      onShowToast('Informe o nome e valor da cobrança.');
      return;
    }

    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const newLink: PaymentLink = {
      id: `link-${Date.now()}`,
      title: title.trim(),
      subtitle: `${billingType === 'recorrente' ? 'Assinatura recorrente' : 'Pagamento único'} via Pix e Cartão`,
      type: billingType,
      typeLabel: billingType === 'recorrente' ? 'Recorrente Mensal' : 'Cobrança Avulsa',
      status: 'Ativo',
      unitPrice: numericAmount,
      unitPriceFormatted: `R$ ${amount}${billingType === 'recorrente' ? '/mês' : ''}`,
      totalBilledFormatted: 'R$ 0,00',
      sales: 0,
      views: 1,
      conversionRate: '0.0%',
      url: `https://nextpay.link/silva-design/${cleanSlug}`,
    };

    onAddPaymentLink(newLink);
    onShowToast(`Link de pagamento para "${newLink.title}" gerado com sucesso!`);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    onShowToast('Link de pagamento copiado para a área de transferência!');
  };

  const handleShareWhatsapp = (link: PaymentLink) => {
    const text = encodeURIComponent(
      `Olá! Segue o link seguro NextPay para acerto de "${link.title}" no valor de ${link.unitPriceFormatted}: ${link.url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    onShowToast('Janela do WhatsApp aberta para compartilhamento');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-xl max-w-[1540px] mx-auto w-full">
        {/* Top Level Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest bg-surface-container-high px-space-sm py-0.5 rounded-full font-semibold">
                NextPay Checkout v2.4
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">•</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                Liquidação Instantânea D+0
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
              Links de Pagamento & Cobranças
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Emita links instantâneos para WhatsApp, redes ou propostas comerciais. Automatize
              réguas com lembretes inteligentes sem taxa de emissão.
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('quick-generator-panel');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-md rounded-xl font-title-md text-title-md shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
              <span>+ Criar Novo Link de Pagamento</span>
            </button>
          </div>
        </header>

        {/* Top Statistical Strip */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase font-semibold">
                Volume Faturado (Mês)
              </span>
              <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
            </div>
            <div className="mt-space-sm">
              <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
                R$ 38.450,00
              </div>
              <div className="flex items-center gap-1 mt-1 text-secondary font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+22.4% vs mês anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase font-semibold">
                Conversão Média de Links
              </span>
              <span className="material-symbols-outlined text-[20px] text-primary">
                donut_large
              </span>
            </div>
            <div className="mt-space-sm flex items-baseline justify-between">
              <div>
                <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
                  78.6%
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  48 vendas de 61 aberturas
                </span>
              </div>
              <svg
                className="w-16 h-8 text-secondary overflow-visible"
                fill="none"
                viewBox="0 0 64 32"
              >
                <path
                  d="M2 28L18 20L34 22L48 10L62 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
              </svg>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase font-semibold">
                Cobranças Pendentes
              </span>
              <span className="material-symbols-outlined text-[20px] text-outline">
                pending_actions
              </span>
            </div>
            <div className="mt-space-sm">
              <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
                R$ 4.280,00
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                3 cobranças vencendo hoje
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase font-semibold">
                Taxa Efetiva Média
              </span>
              <span className="material-symbols-outlined text-[20px] text-tertiary">tune</span>
            </div>
            <div className="mt-space-sm">
              <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">1,89%</div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Com spread NextPay de 1% + R$ 0,49
              </span>
            </div>
          </div>
        </section>

        {/* SECTION: Gerador Rápido de Cobrança / Link de Pagamento */}
        <section
          className="bg-surface-container-lowest rounded-2xl shadow-md p-space-lg lg:p-space-xl relative overflow-hidden border border-surface-container/60"
          id="quick-generator-panel"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-lg mb-space-lg border-b border-surface-container-highest/60">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">link</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Gerador Rápido de Cobrança & Link
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Configure métodos de liquidação e automações de régua em 30 segundos.
                </p>
              </div>
            </div>

            <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-surface-container">
              <button
                type="button"
                onClick={() => setBillingType('avulsa')}
                className={`px-space-md py-space-xs font-title-md text-body-md rounded-lg font-semibold transition-all ${
                  billingType === 'avulsa'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Cobrança Avulsa
              </button>
              <button
                type="button"
                onClick={() => setBillingType('recorrente')}
                className={`px-space-md py-space-xs font-title-md text-body-md rounded-lg font-semibold transition-all ${
                  billingType === 'recorrente'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Assinatura Recorrente
              </button>
            </div>
          </div>

          <form
            onSubmit={handleCreateLink}
            className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl"
          >
            {/* Left Column: Core Data */}
            <div className="lg:col-span-7 space-y-space-lg">
              <div className="space-y-space-xs">
                <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
                  <span>Nome do Serviço ou Produto</span>
                  <span className="text-on-surface-variant font-body-sm text-body-sm">
                    Exibido na tela de checkout
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-on-surface-variant material-symbols-outlined text-[20px]">
                    edit_note
                  </span>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Projeto Identidade Visual, Mentoria..."
                    className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-space-md py-space-sm rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="space-y-space-xs">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">
                    Valor a Cobrar
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-title-md text-body-md font-bold text-on-surface-variant">
                      R$
                    </span>
                    <input
                      type="text"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-numeric-md text-headline-sm font-bold pl-12 pr-space-md py-space-sm rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-all text-right"
                    />
                  </div>
                  <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant pt-1">
                    <span>Recebimento líquido estimado:</span>
                    <span className="text-secondary font-semibold font-numeric-md text-body-sm">
                      R$ {netPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Pix D+0)
                    </span>
                  </div>
                </div>

                <div className="space-y-space-xs">
                  <label className="font-label-md text-label-md font-semibold text-on-surface">
                    Vencimento / Expiração do Link
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-on-surface-variant material-symbols-outlined text-[20px]">
                      event
                    </span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md pl-10 pr-space-md py-space-sm rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant pt-1">
                    Após esta data o QR Code e link são invalidados
                  </p>
                </div>
              </div>

              {/* Payment Methods Config Box */}
              <div className="bg-surface-container-low/70 p-space-md rounded-2xl space-y-space-md border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-title-md font-bold text-on-surface">
                    Formas de Recebimento Habilitadas
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold bg-secondary-container/20 px-2 py-0.5 rounded-full">
                    Taxas Oficiais NextPay
                  </span>
                </div>

                {/* Pix Dinâmico Toggle */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-md border border-surface-container/60">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-secondary-fixed/30 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-body-md font-bold text-on-surface">
                          Pix Dinâmico Instantâneo
                        </span>
                        <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                          R$ 2,48
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Compensação na hora com baixa automática NextPay D+0.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enablePix}
                      onChange={(e) => setEnablePix(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                {/* Cartão de Crédito Toggle & Parcelamento */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-surface-container/60">
                  <div className="flex items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">credit_card</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-body-md font-bold text-on-surface">
                            Cartão de Crédito
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Taxa 3.99% + R$ 0,98 à vista
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Aceita Visa, Mastercard, Elo e Amex com antifraude 3DS 2.0 ativo.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={enableCard}
                        onChange={(e) => setEnableCard(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {enableCard && (
                    <div className="pt-space-sm border-t border-surface-container space-y-space-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                        <div>
                          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                            Máximo de Parcelas Permitidas
                          </label>
                          <select
                            value={maxInstallments}
                            onChange={(e) => setMaxInstallments(e.target.value)}
                            className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-1.5 px-space-sm rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="1x">Até 1x (À vista)</option>
                            <option value="6x">Até 6x (4,49% + R$ 0,98)</option>
                            <option value="12x">Até 12x (4,99% + R$ 0,98)</option>
                            <option value="21x">Até 21x (5,29% + R$ 0,98)</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                            Repasse de Juros do Parcelamento
                          </label>
                          <div className="flex items-center gap-space-sm pt-1">
                            <label className="flex items-center gap-1.5 text-body-sm font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="fee_bearer"
                                checked={feeBearer === 'client'}
                                onChange={() => setFeeBearer('client')}
                                className="text-primary focus:ring-primary"
                              />
                              <span>Cliente assume juros</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-body-sm font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="fee_bearer"
                                checked={feeBearer === 'seller'}
                                onChange={() => setFeeBearer('seller')}
                                className="text-primary focus:ring-primary"
                              />
                              <span>Assumir juros (Sem acréscimo)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Boleto Bancário Registrado */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-surface-container/60">
                  <div className="flex items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[22px]">receipt</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-title-md text-body-md font-bold text-on-surface">
                            Boleto Bancário Registrado
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            1% + R$ 2,48 por liquidação
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Compensação em D+1 com código de barras e linha digitável CIP.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={enableBoleto}
                        onChange={(e) => setEnableBoleto(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Automação & Régua */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-space-lg">
              <div className="bg-surface-container-low/70 p-space-md rounded-2xl space-y-space-md border border-surface-container">
                <div className="flex items-center gap-space-xs text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    notifications_active
                  </span>
                  <span className="font-title-md text-title-md font-bold text-on-surface">
                    Régua Automática de Cobrança
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Disparos inteligentes sem precisar mandar mensagem manual.
                </p>

                <div className="space-y-space-sm">
                  {/* WhatsApp Notification */}
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-2 border border-surface-container/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          chat
                        </span>
                        <span className="font-title-md text-body-md font-semibold text-on-surface">
                          Notificações por WhatsApp
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableWhatsapp}
                        onChange={(e) => setEnableWhatsapp(e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                    {enableWhatsapp && (
                      <div className="text-body-sm text-on-surface-variant pl-6 space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-primary" />
                          <span>Aviso imediato ao criar link</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-primary" />
                          <span>Lembrete 2 dias antes do vencimento</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-primary" />
                          <span>Alerta no dia do vencimento</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Email Notification */}
                  <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-2 border border-surface-container/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          mail
                        </span>
                        <span className="font-title-md text-body-md font-semibold text-on-surface">
                          Notificações por E-mail
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableEmail}
                        onChange={(e) => setEnableEmail(e.target.checked)}
                        className="w-4 h-4 text-primary rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Friendly URL Preview */}
                <div className="p-space-md rounded-xl bg-surface-container-high/60 space-y-2 border border-surface-container">
                  <span className="font-label-sm text-label-sm uppercase font-semibold text-outline">
                    URL Amigável Gerada
                  </span>
                  <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-lg font-body-sm text-on-surface overflow-hidden border border-surface-container">
                    <span className="truncate font-mono text-[12px] text-primary">
                      nextpay.link/silva-design/consultoria-ux
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-outline shrink-0 ml-2">
                      lock
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-space-md flex flex-col sm:flex-row items-center gap-space-sm">
                <button
                  type="submit"
                  className="w-full flex-1 flex items-center justify-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-lg py-space-md rounded-xl font-title-md text-title-md shadow-md transition-all font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>Gerar Link & Ativar Notificações</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setAmount('0,00');
                    onShowToast('Campos limpos');
                  }}
                  className="w-full sm:w-auto px-space-md py-space-md bg-surface-container-low hover:bg-surface-container-high text-on-surface rounded-xl font-title-md text-body-md transition-all border border-surface-container font-medium"
                >
                  Limpar
                </button>
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
                Links reutilizáveis com estatísticas de abertura e conversão em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-space-xs">
              <button
                type="button"
                onClick={() => setLinkFilter('all')}
                className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all font-semibold ${
                  linkFilter === 'all'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Todos ({paymentLinks.length})
              </button>
              <button
                type="button"
                onClick={() => setLinkFilter('recorrente')}
                className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all font-semibold ${
                  linkFilter === 'recorrente'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Recorrentes
              </button>
              <button
                type="button"
                onClick={() => setLinkFilter('avulsa')}
                className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all font-semibold ${
                  linkFilter === 'avulsa'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Avulsos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {filteredLinks.map((link) => (
              <article
                key={link.id}
                className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-space-md border border-surface-container/60"
              >
                <div className="space-y-space-sm">
                  <div className="flex items-start justify-between gap-space-sm">
                    <span
                      className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold uppercase ${
                        link.type === 'recorrente'
                          ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                          : 'bg-primary-fixed text-on-primary-fixed'
                      }`}
                    >
                      {link.typeLabel}
                    </span>
                    <span className="flex items-center gap-1 font-body-sm text-body-sm text-secondary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      {link.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                      {link.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                      {link.subtitle}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-xl space-y-1 border border-surface-container/60">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">Valor unitário:</span>
                      <span className="font-numeric-md font-bold text-on-surface">
                        {link.unitPriceFormatted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-on-surface-variant">Total faturado:</span>
                      <span className="font-numeric-md font-bold text-secondary">
                        {link.totalBilledFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-center pt-1 font-body-sm">
                    <div className="bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container">
                      <div className="font-numeric-md font-semibold text-on-surface">
                        {link.sales}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">Vendas</div>
                    </div>
                    <div className="bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container">
                      <div className="font-numeric-md font-semibold text-on-surface">
                        {link.views}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">Acessos</div>
                    </div>
                    <div className="bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container">
                      <div className="font-numeric-md font-semibold text-secondary">
                        {link.conversionRate}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">Conversão</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-space-sm pt-space-xs border-t border-surface-container">
                  <div className="flex items-center justify-between bg-surface-container-low px-2 py-1 rounded-lg border border-surface-container/60">
                    <span className="font-mono text-[11px] text-on-surface-variant truncate">
                      {link.url}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(link.url)}
                      className="text-primary hover:text-primary-container p-1"
                      title="Copiar Link"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(link.url)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        copy_all
                      </span>
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQrPix(link.title, link.unitPriceFormatted)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        qr_code
                      </span>
                      <span>QR Pix</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsapp(link)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        send
                      </span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCheckoutWithLink(link)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-[11px] transition-colors"
                      title="Abrir tela de checkout do cliente"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        preview
                      </span>
                      <span>Checkout</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
