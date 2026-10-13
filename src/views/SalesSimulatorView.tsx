import React, { useState } from 'react';
import { FEE_TABLE, ANTICIPATION_RATES } from '../data/mockData';

interface SalesSimulatorViewProps {
  onShowToast: (msg: string) => void;
  onNavigate: (view: string) => void;
}

export const SalesSimulatorView: React.FC<SalesSimulatorViewProps> = ({
  onShowToast,
  onNavigate,
}) => {
  const [saleAmount, setSaleAmount] = useState('1000,00');
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_single');
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);
  const [withAnticipation, setWithAnticipation] = useState(false);
  const [passBuyer, setPassBuyer] = useState(false);

  // Parse sale value
  const numValue = parseFloat(saleAmount.replace(/\./g, '').replace(',', '.')) || 0;

  // Selected fee config
  let feeConfig = FEE_TABLE[selectedMethod] || FEE_TABLE.credit_single;

  // Update config based on installments if method is credit
  if (selectedMethod.startsWith('credit')) {
    if (selectedInstallments === 1) {
      feeConfig = FEE_TABLE.credit_single;
    } else if (selectedInstallments <= 6) {
      feeConfig = FEE_TABLE.credit_2_6;
    } else if (selectedInstallments <= 12) {
      feeConfig = FEE_TABLE.credit_7_12;
    } else {
      feeConfig = FEE_TABLE.credit_13_21;
    }
  }

  // NextPay Client Rate (Charged to merchant)
  const clientPct = feeConfig.clientRate.percentage / 100;
  const clientFixed = feeConfig.clientRate.fixed;
  const clientTotalFee = numValue * clientPct + clientFixed;

  // Base Cost
  const basePct = feeConfig.baseCost.percentage / 100;
  const baseFixed = feeConfig.baseCost.fixed;
  const baseTotalCost = numValue * basePct + baseFixed;

  // Gateway Owner Profit (You!)
  const gatewayOwnerProfit = clientTotalFee - baseTotalCost;

  // Anticipation fee if toggled
  let anticipationCost = 0;
  if (withAnticipation) {
    if (selectedInstallments === 1) {
      anticipationCost = numValue * (ANTICIPATION_RATES.credit_single.ratePerMonth / 100);
    } else {
      anticipationCost = numValue * (ANTICIPATION_RATES.credit_installment.ratePerMonth / 100);
    }
  }

  // Merchant Net Receive
  const merchantReceives = Math.max(0, numValue - clientTotalFee - anticipationCost);

  // If customer assumes fee
  const customerPays = passBuyer ? numValue + clientTotalFee : numValue;

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
                NextPay Inteligência de Taxas
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Motor NextPay White-Label
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
              Simule uma Venda & Calcule o Lucro do Gateway
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Descubra quanto você (Dono do Gateway) lucra com o spread de{' '}
              <strong>1% + R$ 0,49</strong> (ou R$ 0,49 fixo no Pix) em cada transação e o valor
              líquido do seu cliente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('configuracoes-de-taxas')}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-body-sm font-semibold border border-surface-container flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">percent</span>
              <span>Ver Tabela Completa</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cobrancas-e-links')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-body-sm font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Criar Cobrança com Esta Taxa</span>
            </button>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Controls Left Column (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 space-y-space-md">
            <div className="space-y-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Valor Bruto da Venda
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-body-md font-bold text-on-surface-variant">
                  R$
                </span>
                <input
                  type="text"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-numeric-lg text-headline-sm font-bold pl-12 pr-space-md py-3 rounded-xl border border-surface-container focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="1.000,00"
                />
              </div>
            </div>

            {/* Method Selector */}
            <div className="space-y-2">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'pix_dynamic', label: 'Pix Dinâmico', icon: 'qr_code_2' },
                  { id: 'pix_key', label: 'Pix Chave', icon: 'vpn_key' },
                  { id: 'credit_single', label: 'Cartão de Crédito', icon: 'credit_card' },
                  { id: 'debit', label: 'Cartão Débito', icon: 'payments' },
                  { id: 'boleto', label: 'Boleto Bancário', icon: 'receipt' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(item.id);
                      if (item.id !== 'credit_single') {
                        setWithAnticipation(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center gap-1 border transition-all ${
                      selectedMethod === item.id ||
                      (selectedMethod.startsWith('credit') && item.id === 'credit_single')
                        ? 'bg-primary-container/10 border-primary text-primary font-semibold shadow-xs'
                        : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pix Dinâmico Details Notice */}
            {selectedMethod === 'pix_dynamic' && (
              <div className="p-3.5 bg-secondary-container/20 rounded-xl border border-secondary/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-secondary">
                  <span>Pix Dinâmico • Receba na hora (D+0)</span>
                  <span>R$ 2,48</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Por cobrança recebida • Custo base: R$ 1,99 • Seu lucro: <strong>R$ 0,49</strong>
                </p>
                <div className="pt-1.5 border-t border-secondary/20 flex items-center gap-1 text-[11px] text-primary font-semibold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>
                    Antecipe a 5,79% ao mês. É necessário enviar nota fiscal ou o contrato do
                    serviço.
                  </span>
                </div>
              </div>
            )}

            {/* Pix Chave Details Notice */}
            {selectedMethod === 'pix_key' && (
              <div className="p-3.5 bg-secondary-container/20 rounded-xl border border-secondary/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-secondary">
                  <span>Pix Chave / Manual • Receba na hora (D+0)</span>
                  <span>R$ 2,48</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Por cobrança recebida • Custo base: R$ 1,99 • Seu lucro: <strong>R$ 0,49</strong>
                </p>
                <div className="pt-1.5 border-t border-secondary/20 flex items-center gap-1 text-[11px] text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>100 gratuitos por mês na conta NextPay.</span>
                </div>
              </div>
            )}

            {/* Boleto Notice */}
            {selectedMethod === 'boleto' && (
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                  <span>Boleto Bancário Registrado • Receba em 1 dia útil</span>
                  <span>1,00% + R$ 2,48</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Por boleto pago • Custo base: R$ 1,99 • Seu lucro: <strong>1% + R$ 0,49</strong>
                </p>
                <div className="pt-1.5 border-t border-surface-container flex items-center gap-1 text-[11px] text-primary font-semibold">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>
                    Antecipe a 5,79% ao mês. É necessário enviar nota fiscal ou o contrato do
                    serviço.
                  </span>
                </div>
              </div>
            )}

            {/* Installments selector if credit */}
            {selectedMethod.startsWith('credit') && (
              <div className="space-y-1 pt-2 border-t border-surface-container/60">
                <div className="flex justify-between items-center text-body-sm">
                  <label className="font-semibold text-on-surface">Número de Parcelas</label>
                  <span className="text-xs font-semibold text-primary">
                    {selectedInstallments === 1
                      ? 'À vista (Receba em 32 dias)'
                      : `${selectedInstallments}x de R$ ${(numValue / selectedInstallments).toFixed(2)}`}
                  </span>
                </div>
                <select
                  value={selectedInstallments}
                  onChange={(e) => setSelectedInstallments(Number(e.target.value))}
                  className="w-full bg-surface-container-low text-on-surface py-2.5 px-3 rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-body-sm"
                >
                  <option value={1}>À vista (1x) • Taxa: 3,99% + R$ 0,98</option>
                  <option value={2}>2x • Taxa: 4,49% + R$ 0,98</option>
                  <option value={3}>3x • Taxa: 4,49% + R$ 0,98</option>
                  <option value={6}>6x • Taxa: 4,49% + R$ 0,98</option>
                  <option value={10}>10x • Taxa: 4,99% + R$ 0,98</option>
                  <option value={12}>12x • Taxa: 4,99% + R$ 0,98</option>
                  <option value={18}>18x • Taxa: 5,29% + R$ 0,98</option>
                  <option value={21}>21x • Taxa: 5,29% + R$ 0,98</option>
                </select>
              </div>
            )}

            {/* Anticipation Switch for Credit */}
            {selectedMethod.startsWith('credit') && (
              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">bolt</span>
                    <span className="font-title-md text-body-md font-semibold text-on-surface">
                      Antecipação para 2 Dias Úteis
                    </span>
                  </div>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                    Taxa de {selectedInstallments === 1 ? '1,25%' : '1,70%'} ao mês para receber o
                    crédito antecipado.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={withAnticipation}
                  onChange={(e) => setWithAnticipation(e.target.checked)}
                  className="w-5 h-5 text-primary rounded cursor-pointer"
                />
              </div>
            )}

            {/* Repasse de juros ao comprador */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
              <div>
                <span className="font-title-md text-body-md font-semibold text-on-surface block">
                  Repassar taxa ao comprador
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {passBuyer
                    ? 'Comprador arca com o acréscimo das taxas no checkout'
                    : 'Vendedor absorve os custos e o cliente paga o valor original'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPassBuyer(!passBuyer)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                  passBuyer ? 'bg-secondary' : 'bg-outline-variant'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow transition duration-200 mt-0.5 ${
                    passBuyer ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                ></span>
              </button>
            </div>
          </div>

          {/* Results & Owner Profit Breakdown Right Column (5 cols) */}
          <div className="lg:col-span-5 space-y-space-md">
            {/* Owner Profit Highlight Card */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-secondary/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
                  Seu Lucro Líquido (Spread NextPay)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/50 text-secondary text-xs font-bold">
                  + 1,00% + R$ 0,49
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-sm font-semibold text-outline">R$</span>
                <span className="font-numeric-lg text-[32px] font-bold text-secondary">
                  {gatewayOwnerProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Depositado diretamente no seu saldo em conta NextPay (Banco 461 • Ag 0001 • C/C
                7342797-3) a cada venda realizada.
              </p>

              <div className="mt-4 pt-3 border-t border-surface-container space-y-1.5 text-xs">
                {feeConfig.markup.percentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">
                      Spread percentual ({feeConfig.markup.percentage}%):
                    </span>
                    <span className="font-mono font-semibold text-secondary">
                      + R$ {(numValue * (feeConfig.markup.percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Spread fixo por transação:</span>
                  <span className="font-mono font-semibold text-secondary">
                    + R$ {feeConfig.markup.fixed.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Merchant Settlement Calculation */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 space-y-3">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Detalhamento para o Lojista
              </h3>

              <div className="space-y-2 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Valor Bruto da Venda:</span>
                  <span className="font-numeric-md font-bold text-on-surface">
                    R$ {numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-error">
                  <span>
                    Taxa Cobrada NextPay (
                    {feeConfig.clientRate.percentage > 0
                      ? `${feeConfig.clientRate.percentage}% + `
                      : ''}
                    R$ {feeConfig.clientRate.fixed.toFixed(2)}):
                  </span>
                  <span className="font-numeric-md font-semibold">
                    - R$ {clientTotalFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {withAnticipation && (
                  <div className="flex justify-between text-tertiary">
                    <span>Taxa de Antecipação:</span>
                    <span className="font-numeric-md font-semibold">
                      - R$ {anticipationCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-outline text-xs pt-1 border-t border-surface-container">
                  <span>(Custo Base de Liquidação Bancária):</span>
                  <span>
                    R$ {baseTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2 border-t border-surface-container flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-semibold text-outline block">
                      O Lojista Recebe (Líquido)
                    </span>
                    <span className="text-[11px] text-secondary font-medium">
                      Prazo: {feeConfig.deadline} {withAnticipation ? '(Antecipado em 2 dias)' : ''}
                    </span>
                  </div>
                  <span className="font-numeric-lg text-[24px] font-bold text-primary">
                    R$ {merchantReceives.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    `Simulação copiada: Venda R$ ${saleAmount} -> Seu Lucro: R$ ${gatewayOwnerProfit.toFixed(2)}`,
                  )
                }
                className="w-full mt-2 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copiar Detalhes da Simulação</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
