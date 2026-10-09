import React, { useState } from 'react';
import { INITIAL_WEBHOOK_LOGS, WebhookLog } from '../data/mockData';

interface RatesAndIntegrationsViewProps {
  onShowToast: (msg: string) => void;
}

export const RatesAndIntegrationsView: React.FC<RatesAndIntegrationsViewProps> = ({
  onShowToast,
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
  const [pixKey, setPixKey] = useState('financeiro@silva.design');
  const [bankAgency, setBankAgency] = useState('0924');
  const [bankAccount, setBankAccount] = useState('88412-9');

  const prodToken = '$aact_YTU1YTE0M2M6N2NmNy00MGI0LWE2ZjQtZDAwZDE4OGE5NzM2XzAxOTIwMzk0';
  const sandboxToken = '$aact_sbx_ZTM1Mjg3NmEtYjlmMC00MjExLTk5MDAtOGU1MDYxNDcxYmRlXzAyMDE';
  const currentToken = environment === 'prod' ? prodToken : sandboxToken;

  const handleTestLatency = () => {
    setIsTestingLatency(true);
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 30) + 95; // 95 - 125ms
      setCurrentLatency(ping);
      setIsTestingLatency(false);
      onShowToast(`Latência da API Asaas: ${ping}ms • Conexão em tempo real Excelente!`);
    }, 600);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(currentToken);
    setCopiedToken(true);
    onShowToast(`Token de API (${environment.toUpperCase()}) copiado com sucesso!`);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadPayloads = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(INITIAL_WEBHOOK_LOGS, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'nexuspay_webhooks_payload.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Arquivo nexuspay_webhooks_payload.json baixado com sucesso!');
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
                Protocolo Asaas Direct Connect
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Taxas, APIs & Conexões E-commerce
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Gerencie margens operacionais, chaves de liquidação bancária e conectores nativos de vendas.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
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

        {/* SECTION: Tabela de Taxas & Custos Operacionais */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">percent</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Tabela de Taxas & Custos Operacionais
              </h2>
              <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                Transparência 100%
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Liquidação direta na sua subconta Asaas White-Label
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Card Pix Direto */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                  </div>
                  <span className="bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    D+0 Instantâneo
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Pix Direto
                </span>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-label-md text-label-md text-outline font-bold">R$</span>
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    0,99
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">/ compensado</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Taxa fixa por liquidação aprovada. 0.00% de taxa percentual, sem cobrança em QR Codes expirados.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between border border-surface-container/60">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Prazo de Resgate</span>
                <span className="font-label-sm text-label-sm font-semibold text-secondary">
                  Tempo Real (&lt; 3s)
                </span>
              </div>
            </div>

            {/* Card Cartão à Vista */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">credit_card</span>
                  </div>
                  <span className="bg-surface-container-high text-primary px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    D+30 Padrão
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Cartão à Vista
                </span>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    2,99%
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">+ R$ 0,49</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Antifraude avançado incluso com tecnologia 3DS 2.0 e tokenização segura de cartões recorrentes.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between border border-surface-container/60">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Antecipação D+1</span>
                <span className="font-label-sm text-label-sm font-semibold text-primary">
                  Opcional (+1.19% a.m.)
                </span>
              </div>
            </div>

            {/* Card Cartão Parcelado */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[24px]">layers</span>
                  </div>
                  <span className="bg-surface-container-high text-tertiary px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    2x até 12x
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Cartão Parcelado
                </span>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    3,49%
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">+ 1.49%/parc.</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-on-surface-variant">
                  <span className="font-body-sm text-body-sm">Repasse de juros:</span>
                  <span
                    className={`font-label-sm text-label-sm font-semibold ${
                      passBuyerInstallment ? 'text-secondary' : 'text-primary'
                    }`}
                  >
                    {passBuyerInstallment ? 'Repassado ao cliente' : 'Vendedor absorve'}
                  </span>
                </div>
              </div>
              <div className="mt-space-md pt-space-sm flex items-center justify-between bg-surface-container-low p-space-xs rounded-lg border border-surface-container/60">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Taxa no comprador
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPassBuyerInstallment(!passBuyerInstallment);
                    onShowToast(
                      !passBuyerInstallment
                        ? 'Juros de parcelamento transferidos para o comprador'
                        : 'Juros de parcelamento absorvidos pelo vendedor'
                    );
                  }}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                    passBuyerInstallment ? 'bg-secondary' : 'bg-outline-variant'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest shadow transition duration-200 mt-0.5 ${
                      passBuyerInstallment ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  ></span>
                </button>
              </div>
            </div>

            {/* Card Boleto Bancário */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container/60">
              <div className="absolute top-0 left-0 right-0 h-1 bg-on-surface-variant"></div>
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">receipt</span>
                  </div>
                  <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    D+1 Útil
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Boleto Bancário
                </span>
                <div className="flex items-baseline gap-1 my-space-xs">
                  <span className="font-label-md text-label-md text-outline font-bold">R$</span>
                  <span className="font-numeric-lg text-numeric-lg text-on-surface font-bold tracking-tight">
                    1,99
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">/ liquidado</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Custo cobrado única e exclusivamente no pagamento. Emissão, 2ª via e cancelamentos são gratuitos.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-xs rounded-lg flex items-center justify-between border border-surface-container/60">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Tarifa de Emissão</span>
                <span className="font-label-sm text-label-sm font-semibold text-secondary">
                  R$ 0,00 Grátis
                </span>
              </div>
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
                  <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                      Conectores de E-commerce & Plataformas
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sincronize pedidos e checkout transparente com 1 clique
                    </p>
                  </div>
                </div>
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-semibold">
                  5 Plataformas Prontas
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
                        Sincronizando loja: estúdio-criativo-store.myshopify.com
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Documentação Shopify aberta')}
                      className="px-space-sm py-1.5 bg-surface-container-lowest hover:bg-surface-container-high rounded text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-1 border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">menu_book</span> Docs
                    </button>
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
                      <span className="material-symbols-outlined text-[16px]">bolt</span> Conectar com 1 Clique
                    </button>
                  </div>
                </div>

                {/* Hotmart & Kiwify */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors gap-space-sm border border-surface-container/60">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
                      <span className="material-symbols-outlined text-secondary text-[28px]">
                        rocket_launch
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Hotmart & Kiwify (Infoprodutos)
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Integrado
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Webhooks de checkout externo com emissão de recibo Pix
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Webhooks de Infoprodutos configurados')}
                      className="px-space-md py-1.5 bg-surface-container-high hover:bg-surface-variant rounded text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">tune</span> Configurar
                    </button>
                  </div>
                </div>

                {/* Custom Webhook */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors gap-space-sm border border-surface-container/60">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest shadow-sm flex items-center justify-center shrink-0 border border-surface-container">
                      <span className="material-symbols-outlined text-outline text-[28px]">
                        webhook
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Webhook HTTP Customizado
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full font-medium">
                          Personalizado
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Envie eventos para qualquer URL HTTPS própria ou Zapier/n8n
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onShowToast('Novo endpoint webhook registrado')}
                      className="px-space-md py-1.5 bg-surface-container-lowest hover:bg-surface-container-high rounded text-on-surface-variant font-label-md text-label-md transition-colors flex items-center gap-1 border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span> Adicionar Endpoint
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank details for auto payout */}
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
                      Transferência programada do saldo disponível sem taxas adicionais de saque
                    </p>
                  </div>
                </div>
                <span className="bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> Conta Verificada
                </span>
              </div>

              {isEditingBank ? (
                <div className="p-space-md bg-surface-container-low rounded-lg space-y-3 border border-surface-container">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                        Chave Pix
                      </label>
                      <input
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        className="w-full bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container text-body-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                        Agência & Conta (Itaú)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bankAgency}
                          onChange={(e) => setBankAgency(e.target.value)}
                          placeholder="Agência"
                          className="w-20 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container text-body-sm font-mono"
                        />
                        <input
                          type="text"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="Conta"
                          className="flex-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-surface-container text-body-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingBank(false)}
                      className="px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingBank(false);
                        onShowToast('Dados bancários atualizados com sucesso via 2FA!');
                      }}
                      className="px-3 py-1 text-xs bg-primary text-on-primary rounded font-semibold"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md p-space-md bg-surface-container-low rounded-lg border border-surface-container/60">
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                      Chave Pix de Liquidação
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
                      Repasse diário automático às 18:00 (Segunda a Sexta)
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
                            Itaú Unibanco (341)
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Ag: {bankAgency} • CC: {bankAccount}
                          </span>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary font-semibold">
                        Titular CNPJ
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Razão: SILVA DESIGN E TECNOLOGIA LTDA
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    verified_user
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Protegido por Autenticação em Duas Etapas (2FA Asaas Segura)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingBank(!isEditingBank)}
                  className="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>{' '}
                  {isEditingBank ? 'Fechar Edição' : 'Alterar Conta de Destino'}
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
                  <span className="material-symbols-outlined text-primary text-[22px]">terminal</span>
                  <div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold">
                      API & Credenciais Gateway
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Conexão transparente Asaas REST v3
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
                    defaultValue="https://api.silva.design/v1/gateways/nexuspay/callback"
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
                    <span className="material-symbols-outlined text-[14px]">check</span> PAYMENT_RECEIVED
                  </span>
                  <span className="px-2 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span> PAYMENT_OVERDUE
                  </span>
                  <span className="px-2 py-1 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check</span> PAYMENT_REFUNDED
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
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Últimas 5 requisições de callback processadas pela infraestrutura Asaas:
              </p>

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
                  Payload Completo (.JSON)
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

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>ID do Evento:</span>
                  <span className="font-mono text-on-surface font-semibold">{selectedLog.code}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tempo de Resposta:</span>
                  <span className="font-mono text-secondary font-semibold">
                    {selectedLog.latencyMs}ms
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container overflow-x-auto">
                <span className="text-[11px] font-semibold text-outline uppercase block mb-1">
                  JSON Payload
                </span>
                <pre className="font-mono text-[11px] text-on-surface overflow-x-auto whitespace-pre">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog.payload, null, 2));
                    onShowToast('Payload JSON copiado para a área de transferência');
                  }}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold"
                >
                  Copiar JSON
                </button>
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
