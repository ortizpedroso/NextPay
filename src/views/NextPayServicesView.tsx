import React, { useState } from 'react';
import { NEXTPAY_ACCOUNT } from '../data/mockData';

interface NextPayServicesViewProps {
  serviceId: string;
  onShowToast: (msg: string) => void;
  onNavigate: (view: string) => void;
}

export const NextPayServicesView: React.FC<NextPayServicesViewProps> = ({
  serviceId,
  onShowToast,
  onNavigate,
}) => {
  const [serasaDoc, setSerasaDoc] = useState('');
  const [isConsultingSerasa, setIsConsultingSerasa] = useState(false);
  const [serasaResult, setSerasaResult] = useState<any>(null);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [billAmount, setBillAmount] = useState('189,50');
  const [billPaid, setBillPaid] = useState(false);

  // Service configuration details
  const serviceConfigs: Record<
    string,
    {
      title: string;
      badge: string;
      icon: string;
      description: string;
    }
  > = {
    'vendas-fisicas': {
      title: 'Vendas Físicas & NextPay Tap',
      badge: 'Presencial D+0',
      icon: 'contactless',
      description:
        'Transforme seu smartphone em maquininha de cartão por aproximação (NFC) ou adquira terminais Smart POS com integração direta à conta NextPay.',
    },
    'cartao-nextpay': {
      title: 'Cartão da Conta NextPay',
      badge: 'Bandeira Elo / Visa',
      icon: 'credit_card',
      description:
        'Cartão de débito e crédito empresarial com saldo compartilhado em conta. Realize saques na Rede Banco24Horas e compras internacionais.',
    },
    'pague-contas': {
      title: 'Pague Contas & Tributos',
      badge: 'Débito em Conta D+0',
      icon: 'barcode_scanner',
      description:
        'Pague concessionárias de água, energia, DAS MEI, DARF e boletos de fornecedores debitando diretamente do seu saldo disponível.',
    },
    'notas-fiscais': {
      title: 'Notas Fiscais de Serviço (NFS-e)',
      badge: 'Emissão Automatizada',
      icon: 'description',
      description:
        'Emissão e envio automático de Notas Fiscais eletrônicas de serviço para seu cliente no momento da liquidação da cobrança.',
    },
    serasa: {
      title: 'Consulta Serasa & Negativação',
      badge: 'Proteção ao Crédito',
      icon: 'policy',
      description:
        'Consulte score de crédito, protestos e dívidas de CPF e CNPJ antes de fechar negócios, ou negative clientes inadimplentes com 1 clique.',
    },
    'open-finance': {
      title: 'Open Finance Brasil',
      badge: 'Banco Central do Brasil',
      icon: 'account_tree',
      description:
        'Compartilhe dados e saldos de outros bancos autorizados pelo BACEN para obter taxas de antecipação ainda menores e limites de crédito expandidos.',
    },
    'flapp-store': {
      title: 'Flapp Store (Loja de Aplicativos)',
      badge: 'Ecossistema NextPay',
      icon: 'storefront',
      description:
        'Conectores certificados para ERPs, CRMs (Bling, Tiny, Omie), esteiras de checkout e automações no ecossistema financeiro.',
    },
    beneficios: {
      title: 'Meus Benefícios & Indique um Amigo',
      badge: 'Cashback & Recompensas',
      icon: 'loyalty',
      description:
        'Ganhe R$ 50,00 por cliente que ativar e transacionar via NextPay com seu link exclusivo de indicação.',
    },
  };

  const current = serviceConfigs[serviceId] || serviceConfigs['vendas-fisicas'];

  const handleConsultSerasa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serasaDoc) {
      onShowToast('Informe o CPF ou CNPJ para consulta');
      return;
    }
    setIsConsultingSerasa(true);
    setTimeout(() => {
      setIsConsultingSerasa(false);
      setSerasaResult({
        score: 840,
        classification: 'Excelente (Baixo risco)',
        pendencias: 0,
        protestos: 0,
        doc: serasaDoc,
      });
      onShowToast('Consulta Serasa Experian concluída com sucesso!');
    }, 1200);
  };

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) {
      onShowToast('Informe o código de barras ou linha digitável');
      return;
    }
    setBillPaid(true);
    onShowToast(`Boleto de R$ ${billAmount} agendado para liquidação!`);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 lg:px-space-xl py-space-lg space-y-space-lg max-w-[1600px] mx-auto w-full">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-outline mb-1">
              <span>NextPay Whitelabel</span>
              <span>•</span>
              <span>Serviços Bancários Integrados (461)</span>
              <span>•</span>
              <span className="text-primary font-medium">{current.title}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[26px] text-primary">
                {current.icon}
              </span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                {current.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-container text-on-primary">
                {current.badge}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-3 py-1.5 rounded-lg border border-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Voltar ao Início
            </button>
            <button
              type="button"
              onClick={() => onNavigate('simular-venda')}
              className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-on-secondary-fixed-variant transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">calculate</span>
              Simular Venda
            </button>
          </div>
        </div>

        {/* Dynamic Context Render */}
        {serviceId === 'serasa' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
              <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  search_check
                </span>
                Nova Consulta Serasa
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Consulte qualquer CPF ou CNPJ diretamente na base da Serasa Experian com custo de R$
                9,90 debitado da sua conta NextPay.
              </p>
              <form onSubmit={handleConsultSerasa} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-outline block mb-1">
                    CPF ou CNPJ do Cliente
                  </label>
                  <input
                    type="text"
                    value={serasaDoc}
                    onChange={(e) => setSerasaDoc(e.target.value)}
                    placeholder="000.000.000-00 ou CNPJ"
                    className="w-full px-3 py-2 text-sm bg-surface-container-low rounded-lg border border-surface-container text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConsultingSerasa}
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isConsultingSerasa ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                      <span>Consultando Serasa...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>Realizar Consulta (R$ 9,90)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
              <h3 className="font-title-md text-title-md font-bold text-on-surface mb-4 flex items-center justify-between">
                <span>Resultado da Análise de Risco</span>
                {serasaResult && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container">
                    Score: {serasaResult.score}/1000
                  </span>
                )}
              </h3>
              {serasaResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary-container/10 border border-secondary/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-outline block">Documento Consultado</span>
                      <strong className="text-sm text-on-surface">{serasaResult.doc}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-outline block">Classificação Serasa</span>
                      <strong className="text-sm text-secondary">
                        {serasaResult.classification}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-outline block">Restrições / Protestos</span>
                      <strong className="text-sm text-secondary font-bold">
                        Nenhuma Pendência
                      </strong>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant flex items-center justify-between">
                    <span>
                      Recomendação de Crédito:{' '}
                      <strong>Aprovado para vendas a prazo ou parceladas até R$ 25.000,00</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onShowToast('Relatório PDF baixado!')}
                      className="text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Baixar Laudo Oficial
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant space-y-2">
                  <span className="material-symbols-outlined text-[48px] text-outline/50">
                    manage_search
                  </span>
                  <p className="text-sm font-medium">Nenhuma consulta realizada nesta sessão</p>
                  <p className="text-xs text-outline max-w-md">
                    Insira o documento ao lado para obter imediatamente o score Serasa Experian,
                    apontamentos no SPC/PEFIN e dívidas ativas.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : serviceId === 'pague-contas' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
              <h3 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
                Pagar Boleto com Saldo
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Liquide faturas de concessionárias e boletos de fornecedores utilizando o saldo de{' '}
                <strong>{NEXTPAY_ACCOUNT.balanceFormatted}</strong> sem tarifas de TED.
              </p>
              <form onSubmit={handlePayBill} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-outline block mb-1">
                    Linha Digitável ou Código de Barras
                  </label>
                  <textarea
                    rows={2}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="23793.38128 60037.182910 82000.063304 9 94820000018950"
                    className="w-full px-3 py-2 text-xs font-mono bg-surface-container-low rounded-lg border border-surface-container text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-outline block mb-1">
                    Valor do Boleto (R$)
                  </label>
                  <input
                    type="text"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-surface-container-low rounded-lg border border-surface-container text-on-surface focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-semibold text-xs hover:bg-on-secondary-fixed-variant transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirmar Pagamento com Saldo D+0</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
              <h3 className="font-title-md text-title-md font-bold text-on-surface mb-4">
                Histórico de Contas Liquidadas
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-primary-container/20 text-primary material-symbols-outlined text-[20px]">
                      electric_bolt
                    </span>
                    <div>
                      <strong className="text-on-surface block text-sm">
                        ENEL Distribuição São Paulo
                      </strong>
                      <span className="text-outline">Conta de Luz • Ref 09/2026</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-on-surface block text-sm">R$ 342,80</strong>
                    <span className="text-secondary font-semibold">Liquidado Hoje 09:12</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-secondary-container/20 text-secondary material-symbols-outlined text-[20px]">
                      language
                    </span>
                    <div>
                      <strong className="text-on-surface block text-sm">
                        AWS Cloud Services Brasil
                      </strong>
                      <span className="text-outline">Hospedagem & Servidores API</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <strong className="text-on-surface block text-sm">R$ 1.420,50</strong>
                    <span className="text-secondary font-semibold">Liquidado Ontem</span>
                  </div>
                </div>

                {billPaid && (
                  <div className="p-3.5 rounded-xl bg-secondary-container/20 border border-secondary/40 flex items-center justify-between text-xs animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-secondary text-on-secondary material-symbols-outlined text-[20px]">
                        done_all
                      </span>
                      <div>
                        <strong className="text-on-surface block text-sm">
                          Novo Boleto Agendado
                        </strong>
                        <span className="text-outline">Compensação bancária CIP Integrada</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-secondary block text-sm">R$ {billAmount}</strong>
                      <span className="text-secondary font-semibold">Em processamento</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Service Showcase */}
            <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Status de Ativação do Módulo
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Disponível na sua conta NextPay
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Este serviço opera sob a infraestrutura autorizada da NextPay Instituição de
                Pagamento. Todas as transações são integradas diretamente ao saldo unificado da
                NextPay.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-xs text-outline block">Conta Vinculada</span>
                  <strong className="text-sm text-on-surface block mt-0.5">
                    Banco 461 • Ag 0001 • CC {NEXTPAY_ACCOUNT.account}
                  </strong>
                  <span className="text-[11px] text-secondary font-medium">
                    Titular: {NEXTPAY_ACCOUNT.ownerName}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-xs text-outline block">Prazo de Compensação</span>
                  <strong className="text-sm text-on-surface block mt-0.5">
                    Instantâneo / D+0
                  </strong>
                  <span className="text-[11px] text-secondary font-medium">
                    Sem tarifa de manutenção
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onShowToast('Módulo ativado com sucesso em sua conta!')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Habilitar Este Recurso na NextPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('configuracoes-de-taxas')}
                  className="px-4 py-2.5 rounded-xl border border-surface-container text-on-surface-variant font-semibold text-xs hover:bg-surface-container transition-colors"
                >
                  Ver Taxas Aplicáveis
                </button>
              </div>
            </div>

            {/* Quick Benefits sidebar */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-4">
              <h4 className="font-title-sm text-title-sm font-bold text-on-surface">
                Por que usar via NextPay?
              </h4>
              <ul className="space-y-3 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>Spread adicional para o gateway:</strong> Você ganha 1% + R$ 0,49 em
                    todas as cobranças processadas pelos seus clientes.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>Baixa bancária 100% automatizada:</strong> Sem necessidade de upload
                    manual de arquivo de retorno CNAB 240/400.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>
                    <strong>Notificações WhatsApp & E-mail:</strong> Régua de cobrança automática
                    inclusa sem custo extra de disparo.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
