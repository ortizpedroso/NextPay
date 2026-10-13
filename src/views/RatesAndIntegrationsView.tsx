import React, { useState } from 'react';
import {
  INITIAL_WEBHOOK_LOGS,
  WebhookLog,
  FEE_TABLE,
  ANTICIPATION_RATES,
  NEXTPAY_ACCOUNT,
} from '../data/mockData';

interface RatesAndIntegrationsViewProps {
  onShowToast: (msg: string) => void;
  onOpenSimulator?: () => void;
}

export const RatesAndIntegrationsView: React.FC<RatesAndIntegrationsViewProps> = ({
  onShowToast,
  onOpenSimulator,
}) => {
  const [environment, setEnvironment] = useState<'prod' | 'sandbox'>('prod');
  const [passBuyerInstallment, setPassBuyerInstallment] = useState(false);
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [currentLatency, setCurrentLatency] = useState<number | null>(null);

  // Webhook inspector
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  // Bank edit state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [pixKey, setPixKey] = useState(NEXTPAY_ACCOUNT.pixKey);
  const [bankAgency, setBankAgency] = useState(NEXTPAY_ACCOUNT.agency);
  const [bankAccount, setBankAccount] = useState(NEXTPAY_ACCOUNT.account);

  const prodToken = '$aact_YTU1YTE0M2M6N2NmNy00MGI0LWE2ZjQtZDAwZDE4OGE5NzM2XzAxOTIwMzk0';
  const sandboxToken = '$aact_sbx_ZTM1Mjg3NmEtYjlmMC00MjExLTk5MDAtOGU1MDYxNDcxYmRlXzAyMDE';
  const currentToken = environment === 'prod' ? prodToken : sandboxToken;

  const handleTestLatency = () => {
    setIsTestingLatency(true);
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 25) + 85;
      setCurrentLatency(ping);
      setIsTestingLatency(false);
      onShowToast(`Latência da API NextPay (Gateway Central): ${ping}ms • Conexão Estável!`);
    }, 500);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(currentToken);
    setCopiedToken(true);
    onShowToast(`Token de API (${environment.toUpperCase()}) copiado com sucesso!`);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadPayloads = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(INITIAL_WEBHOOK_LOGS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'nextpay_webhooks_payload.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Arquivo nextpay_webhooks_payload.json baixado com sucesso!');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="px-4 lg:px-space-lg py-space-md flex flex-col gap-space-lg max-w-[1580px] mx-auto w-full">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="px-space-xs py-0.5 rounded text-secondary font-label-sm text-label-sm bg-secondary-container/40 font-semibold">
                GATEWAY LIQUIDATION v3.4
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Protocolo NextPay Direct Connect • Spread +1% + R$ 0,49
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Taxas, Prazos & Conexões E-commerce
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tabela configurada com custos de liquidação + margem de lucro de{' '}
              <strong>1% + R$ 0,49</strong> (e R$ 0,49 no Pix) para você, dono do gateway.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            {onOpenSimulator && (
              <button
                type="button"
                onClick={onOpenSimulator}
                className="px-3.5 py-2 rounded-lg bg-secondary-container/40 hover:bg-secondary-container/60 text-secondary font-label-md text-xs font-bold transition-all flex items-center gap-1 border border-secondary/30"
              >
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                <span>Simular Venda</span>
              </button>
            )}

            <div className="flex items-center bg-surface-container-high p-1 rounded-lg border border-surface-container">
              <button
                type="button"
                onClick={() => {
                  setEnvironment('prod');
                  onShowToast('Ambiente alternado para Produção (Live)');
                }}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  environment === 'prod'
                    ? 'font-semibold bg-surface-container-lowest text-primary shadow-sm'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Produção</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnvironment('sandbox');
                  onShowToast('Ambiente alternado para Sandbox / Testes');
                }}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  environment === 'sandbox'
                    ? 'font-semibold bg-surface-container-lowest text-primary shadow-sm'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-outline"></span>
                <span>Sandbox / Testes</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestLatency}
              disabled={isTestingLatency}
              className="bg-primary text-on-primary hover:bg-primary-container px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isTestingLatency ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>
                {isTestingLatency
                  ? 'Medindo...'
                  : currentLatency
                    ? `${currentLatency}ms (OK)`
                    : 'Testar Latência API'}
              </span>
            </button>
          </div>
        </div>

        {/* OWNER PROFIT EXPLANATION CALLOUT */}
        <div className="p-4 bg-secondary-container/20 rounded-2xl border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center font-bold">
              %
            </div>
            <div>
              <h2 className="font-title-md font-bold text-on-surface">
                Margem de Lucro do Dono do Gateway Ativada (+1% + R$ 0,49)
              </h2>
              <p className="text-xs text-on-surface-variant">
                O custo base operacional é deduzido e o seu ganho de <strong>1% + R$ 0,49</strong>{' '}
                (ou margem no Pix) por transação é depositado automaticamente na sua conta NextPay.
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[11px] text-outline block">Lucro Acumulado no Mês:</span>
            <span className="font-numeric-lg text-headline-sm font-bold text-secondary">
              {NEXTPAY_ACCOUNT.gatewayProfitMonthFormatted}
            </span>
          </div>
        </div>

        {/* SECTION: Tabela de Taxas Reajustadas */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">percent</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Tabela de Taxas e Prazos NextPay
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Regra Oficial: Custo Base de Liquidação + Margem do Dono do Gateway
            </span>
          </div>

          {/* Top 5 Cards (Including Card do Parcelado, Pix at R$ 2,48, Cartão à vista, Boleto) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-space-md">
            {/* Card 1: Cartão de Crédito à Vista */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  </div>
                  <span className="bg-surface-container-high text-primary px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                    Receba em 32 dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    Cartão à Vista
                  </span>
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    1x no crédito
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    3,99%
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">+ R$ 0,98</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low p-2 rounded-lg border border-surface-container/40">
                  <p className="flex justify-between">
                    <span className="text-outline">Custo Base:</span>
                    <strong>2,99% + R$ 0,49</strong>
                  </p>
                  <p className="flex justify-between text-secondary">
                    <span>Seu Lucro (Dono):</span>
                    <strong>+ 1,00% + R$ 0,49</strong>
                  </p>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container/60 space-y-1">
                <p className="text-[11px] text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Antecipação em até 2 dias:
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  Avulsa à vista: <strong>1,25% a.m.</strong>
                </p>
              </div>
            </div>

            {/* Card 2: Cartão de Crédito Parcelado (CARD DO PARCELADO RESTAURADO) */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[24px]">layers</span>
                  </div>
                  <span className="bg-tertiary-container/50 text-on-tertiary-container px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                    Receba em 32 dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    Cartão Parcelado
                  </span>
                  <span className="text-[10px] text-tertiary uppercase font-semibold">
                    2x até 21x
                  </span>
                </div>
                <div className="my-space-xs space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">2 a 6 parcelas:</span>
                    <strong className="font-mono text-on-surface">4,49% + R$ 0,98</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">7 a 12 parcelas:</span>
                    <strong className="font-mono text-on-surface">4,99% + R$ 0,98</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">13 a 21 parcelas:</span>
                    <strong className="font-mono text-on-surface">5,29% + R$ 0,98</strong>
                  </div>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low p-2 rounded-lg border border-surface-container/40">
                  <p className="flex justify-between text-secondary">
                    <span>Seu Lucro (Dono):</span>
                    <strong>+ 1,00% + R$ 0,49</strong>
                  </p>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container/60 space-y-1">
                <p className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Antecipação em até 2 dias:
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  Avulsa parcelada: <strong>1,70% a.m.</strong>
                </p>
              </div>
            </div>

            {/* Card 3: Pix Dinâmico */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                  </div>
                  <span className="bg-secondary-container/60 text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                    Receba na hora
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    Pix Dinâmico
                  </span>
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Por cobrança
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    R$ 2,48
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">/ recebida</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low p-2 rounded-lg border border-surface-container/40">
                  <p className="flex justify-between">
                    <span className="text-outline">Custo Base:</span>
                    <strong>R$ 1,99</strong>
                  </p>
                  <p className="flex justify-between text-secondary">
                    <span>Seu Lucro (Dono):</span>
                    <strong>+ R$ 0,49</strong>
                  </p>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container/60 space-y-1">
                <p className="text-[11px] text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Antecipe a 5,79% ao mês.
                </p>
                <p className="text-[10px] text-outline leading-tight">
                  É necessário enviar nota fiscal ou o contrato do serviço.
                </p>
              </div>
            </div>

            {/* Card 4: Pix Chave, manual ou QR Code estático */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">vpn_key</span>
                  </div>
                  <span className="bg-secondary-container/60 text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                    Receba na hora
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    Pix Chave / Estático
                  </span>
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Por cobrança
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    R$ 2,48
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">/ recebida</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low p-2 rounded-lg border border-surface-container/40">
                  <p className="flex justify-between">
                    <span className="text-outline">Custo Base:</span>
                    <strong>R$ 1,99</strong>
                  </p>
                  <p className="flex justify-between text-secondary">
                    <span>Seu Lucro (Dono):</span>
                    <strong>+ R$ 0,49</strong>
                  </p>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container/60 space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary bg-secondary-container/30 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  100 gratuitos por mês
                </span>
                <p className="text-[10px] text-outline leading-tight">
                  Franquia da conta NextPay com liquidação instantânea.
                </p>
              </div>
            </div>

            {/* Card 5: Boleto Bancário */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-on-surface-variant"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">receipt</span>
                  </div>
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                    Receba em 1 dia útil
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold">
                    Boleto Bancário
                  </span>
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Por boleto pago
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    1,00%
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">+ R$ 2,48</span>
                </div>
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low p-2 rounded-lg border border-surface-container/40">
                  <p className="flex justify-between">
                    <span className="text-outline">Custo Base:</span>
                    <strong>R$ 1,99</strong>
                  </p>
                  <p className="flex justify-between text-secondary">
                    <span>Seu Lucro (Dono):</span>
                    <strong>+ 1,00% + R$ 0,49</strong>
                  </p>
                </div>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container/60 space-y-1">
                <p className="text-[11px] text-primary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Antecipe a 5,79% ao mês.
                </p>
                <p className="text-[10px] text-outline leading-tight">
                  É necessário enviar nota fiscal ou o contrato do serviço.
                </p>
              </div>
            </div>
          </div>

          {/* ITEM-BY-ITEM DETAILED COMPARISON TABLE */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden mt-space-sm">
            <div className="p-space-md border-b border-surface-container/60 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Relação Completa Item por Item das Taxas & Prazos
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Cálculo oficial com o repasse do custo base e a margem de lucro para o dono do
                  gateway.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container self-start sm:self-auto">
                Conta Bancária NextPay: Banco 461 • Ag 0001
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-surface-container text-outline font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Modalidade de Cobrança</th>
                    <th className="py-3 px-4">Prazo de Recebimento</th>
                    <th className="py-3 px-4">Custo Base de Liquidação</th>
                    <th className="py-3 px-4 text-secondary font-bold">Seu Aumento (Lucro Dono)</th>
                    <th className="py-3 px-4 font-bold text-on-surface">Taxa Final NextPay</th>
                    <th className="py-3 px-4">Regra de Antecipação / Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {/* Pix Dinâmico */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          qr_code_2
                        </span>
                        <div>
                          <span>Pix Dinâmico</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Por cobrança recebida
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-secondary">Receba na hora (D+0)</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">R$ 1,99</td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">+ R$ 0,49</td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono bg-secondary-container/10">
                      R$ 2,48
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-primary font-semibold block">
                        Antecipe a 5,79% ao mês.
                      </span>
                      <span className="text-[10px] text-outline">
                        É necessário enviar nota fiscal ou o contrato do serviço.
                      </span>
                    </td>
                  </tr>

                  {/* Pix Chave */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          vpn_key
                        </span>
                        <div>
                          <span>Pix (Chave, manual ou QR Code estático)</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Por cobrança recebida
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-secondary">Receba na hora (D+0)</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">R$ 1,99</td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">+ R$ 0,49</td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono bg-secondary-container/10">
                      R$ 2,48
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-secondary text-[11px] bg-secondary-container/30 px-2 py-0.5 rounded">
                        100 gratuitos por mês
                      </span>
                    </td>
                  </tr>

                  {/* Boleto Bancário */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                          receipt
                        </span>
                        <div>
                          <span>Boleto Bancário Registrado</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Por boleto pago
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      Receba em 1 dia útil
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">R$ 1,99</td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono bg-secondary-container/10">
                      1,00% + R$ 2,48
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-primary font-semibold block">
                        Antecipe a 5,79% ao mês.
                      </span>
                      <span className="text-[10px] text-outline">
                        É necessário enviar nota fiscal ou o contrato do serviço.
                      </span>
                    </td>
                  </tr>

                  {/* Cartão à vista */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          credit_card
                        </span>
                        <div>
                          <span>Cartão de Crédito à Vista</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Cobranças online e links
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 32 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      2,99% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary font-mono bg-primary-container/10">
                      3,99% + R$ 0,98
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-primary font-semibold">
                        Avulsa à vista: 1,25% ao mês
                      </span>
                      <span className="block text-[10px] text-outline">
                        Receba em até 2 dias úteis.
                      </span>
                    </td>
                  </tr>

                  {/* Cartão 2 a 6 parcelas */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          layers
                        </span>
                        <div>
                          <span>Cartão 2 a 6 parcelas</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Parcelamento médio
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 32 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      3,49% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono">
                      4,49% + R$ 0,98
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-tertiary font-semibold">
                        Avulsa parcelada: 1,7% ao mês
                      </span>
                      <span className="block text-[10px] text-outline">
                        Receba em até 2 dias úteis.
                      </span>
                    </td>
                  </tr>

                  {/* Cartão 7 a 12 parcelas */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          layers
                        </span>
                        <div>
                          <span>Cartão 7 a 12 parcelas</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Parcelamento estendido
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 32 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      3,99% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono">
                      4,99% + R$ 0,98
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-tertiary font-semibold">
                        Avulsa parcelada: 1,7% ao mês
                      </span>
                      <span className="block text-[10px] text-outline">
                        Receba em até 2 dias úteis.
                      </span>
                    </td>
                  </tr>

                  {/* Cartão 13 a 21 parcelas */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          layers
                        </span>
                        <div>
                          <span>Cartão 13 a 21 parcelas</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Longo prazo
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 32 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      4,29% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono">
                      5,29% + R$ 0,98
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span className="text-tertiary font-semibold">
                        Avulsa parcelada: 1,7% ao mês
                      </span>
                    </td>
                  </tr>

                  {/* Cartão de Débito */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          contactless
                        </span>
                        <div>
                          <span>Cartão de Débito</span>
                          <span className="block text-[10px] text-outline font-normal">
                            NextPay Tap ou online
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 3 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">
                      1,89% + R$ 0,35
                    </td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono">
                      2,89% + R$ 0,84
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span>Liquidação automática na conta NextPay</span>
                    </td>
                  </tr>

                  {/* Cartão Voucher */}
                  <tr className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          card_membership
                        </span>
                        <div>
                          <span>Cartão Voucher</span>
                          <span className="block text-[10px] text-outline font-normal">
                            Alimentação e benefícios
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">Receba em 15 dias</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">3,59%</td>
                    <td className="py-3.5 px-4 text-secondary font-bold font-mono">
                      + 1,00% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface font-mono">
                      4,59% + R$ 0,49
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      <span>Taxa fixa para convênios aceitos</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2-COLUMN SECTION: CONNECTORS & CREDENTIALS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Column (7 cols): Connectors & Bank Account */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* E-commerce Connectors */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    storefront
                  </span>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                      Conectores de E-commerce & Plataformas
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sincronize pedidos e checkout transparente NextPay com 1 clique
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-semibold">
                  5 Plataformas Homologadas
                </span>
              </div>

              <div className="flex flex-col gap-space-sm">
                {/* WooCommerce */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors gap-space-sm border border-surface-container/60">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
                      <span className="material-symbols-outlined text-primary text-[28px]">
                        shopping_cart
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          WooCommerce / WordPress
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Ativo
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        v4.8.2 • Pedidos, Pix dinâmico e cartão salvos em tempo real
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Documentação WooCommerce aberta')}
                      className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high rounded text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-1 border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">menu_book</span> Docs
                    </button>
                    <button
                      type="button"
                      onClick={() => onShowToast('Painel de configuração WooCommerce carregado')}
                      className="px-space-md py-1.5 bg-surface-container-high hover:bg-surface-variant rounded text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span> Configurar
                    </button>
                  </div>
                </div>

                {/* Shopify */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors gap-space-sm border border-surface-container/60">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
                      <span className="material-symbols-outlined text-tertiary text-[28px]">
                        shopping_bag
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Shopify App
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Conectado
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Sincronizando loja NextPay
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Exibindo logs de sincronização Shopify')}
                      className="px-space-md py-1.5 bg-surface-container-high hover:bg-surface-variant rounded text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync_alt</span> Logs
                    </button>
                  </div>
                </div>

                {/* Nuvemshop */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors gap-space-sm border border-surface-container/60">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
                      <span className="material-symbols-outlined text-primary text-[28px]">
                        cloud
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Nuvemshop
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full font-medium">
                          Pronto para ativar
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Instalação homologada com split automático de comissões
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Nuvemshop conectada com sucesso!')}
                      className="px-space-md py-1.5 bg-primary text-on-primary hover:bg-primary-container rounded font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">bolt</span> Conectar
                      com 1 Clique
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank details for auto payout - REAL USER DATA */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    account_balance
                  </span>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                      Dados Bancários para Repasse Automático
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Conta oficial NextPay para liquidação dos seus lucros e repasses
                    </p>
                  </div>
                </div>
                <span className="bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Conta Verificada
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md p-space-md bg-surface-container-low rounded-lg border border-surface-container/60">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Chave Pix Oficial
                  </span>
                  <div className="flex items-center justify-between bg-surface-container-lowest px-space-md py-2.5 rounded-lg border border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        vpn_key
                      </span>
                      <span className="font-numeric-md text-numeric-md font-semibold text-on-surface">
                        {pixKey}
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">E-mail</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Repasse diário automático às 18:00
                  </span>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Domicílio Bancário Principal
                  </span>
                  <div className="flex items-center justify-between bg-surface-container-lowest px-space-md py-2.5 rounded-lg border border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        account_balance
                      </span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          Banco 461 - {NEXTPAY_ACCOUNT.bankName}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Agência: {bankAgency} • Conta: {bankAccount}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">
                      Titular
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Titular: {NEXTPAY_ACCOUNT.companyName}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    verified_user
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Protegido por Autenticação em Duas Etapas (2FA NextPay Shield)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('Conta bancária homologada pelo NextPay')}
                  className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span> Conta
                  Homologada
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): API Credentials & Real-time Webhooks */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* API Credentials */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    terminal
                  </span>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                      API & Credenciais NextPay
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Conexão REST v3 API NextPay
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-semibold">
                  {environment.toUpperCase()}
                </span>
              </div>

              {/* Secret Token */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Chave de API Secreta (Token Bearer)
                </label>
                <div className="flex items-center bg-surface-container-low rounded-lg p-1.5 border border-surface-container">
                  <input
                    type={isTokenVisible ? 'text' : 'password'}
                    readOnly
                    value={currentToken}
                    className="w-full bg-transparent font-mono text-body-sm text-on-surface px-space-sm focus:outline-none select-all"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsTokenVisible(!isTokenVisible)}
                      className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                      title={isTokenVisible ? 'Ocultar Chave' : 'Exibir Chave'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isTokenVisible ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="p-1.5 bg-primary text-on-primary hover:bg-primary-container rounded transition-colors flex items-center gap-1 px-2.5 font-semibold text-xs"
                      title="Copiar Token"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedToken ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedToken ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                  Nunca exponha sua chave em aplicações client-side (frontend).
                </span>
              </div>

              {/* Webhook Endpoint */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                    Endpoint URL do Webhook
                  </label>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    Status 200 OK
                  </span>
                </div>
                <div className="flex items-center bg-surface-container-low rounded-lg p-1.5 border border-surface-container">
                  <input
                    type="text"
                    readOnly
                    defaultValue="https://api.nextpay.com.br/v1/webhooks/callback"
                    className="w-full bg-transparent font-mono text-body-sm text-on-surface px-space-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onShowToast('URL do webhook pronta para edição')}
                    className="px-space-sm py-1 bg-surface-container-lowest text-primary rounded font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors border border-surface-container"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Signed Events */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  Eventos Assinados
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                    PAYMENT_RECEIVED
                  </span>
                  <span className="px-2 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                    PAYMENT_OVERDUE
                  </span>
                  <span className="px-2 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span>{' '}
                    PAYMENT_REFUNDED
                  </span>
                  <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> +4 eventos
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Webhooks Stream */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm border border-surface-container/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    monitor_heart
                  </span>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">
                    Log de Webhooks em Tempo Real
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  99.98% Sucesso
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-space-xs">
                {INITIAL_WEBHOOK_LOGS.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-surface-container/60"
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="font-label-sm text-label-sm font-bold px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                        {log.status} OK
                      </span>
                      <div className="flex flex-col">
                        <span className="font-mono font-label-md text-label-md text-on-surface font-semibold">
                          {log.event}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          {log.code} • {log.detail}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">
                        {log.timeAgo}
                      </span>
                      <span className="font-label-sm text-label-sm text-outline font-mono">
                        {log.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container/60">
                <button
                  type="button"
                  onClick={handleDownloadPayloads}
                  className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span> Baixar
                  Payload (.JSON)
                </button>
                <span className="font-body-sm text-body-sm text-outline">
                  Retenção de logs: 30 dias
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-surface-container-lowest max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-surface-container space-y-4">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono text-xs font-bold">
                    200 OK
                  </span>
                  <span className="font-mono text-sm font-bold text-on-surface">
                    {selectedLog.event}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container overflow-x-auto">
                <span className="text-[11px] font-semibold text-outline uppercase block mb-1">
                  Payload com Retenção do Dono do Gateway
                </span>
                <pre className="font-mono text-[11px] text-on-surface overflow-x-auto whitespace-pre">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-container"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
