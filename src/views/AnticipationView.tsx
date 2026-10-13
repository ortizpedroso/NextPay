import React, { useState } from 'react';
import { ANTICIPATION_RATES } from '../data/mockData';

interface AnticipationViewProps {
  onShowToast: (msg: string) => void;
  onConfirmWithdraw: (amount: number) => void;
}

export const AnticipationView: React.FC<AnticipationViewProps> = ({
  onShowToast,
  onConfirmWithdraw,
}) => {
  const [selectedReceivable, setSelectedReceivable] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const receivables = [
    {
      id: 'rec-1',
      description: 'Guilherme Mendes • Redesign Web (3x)',
      originalDate: 'Em 32 dias (10/11)',
      amount: 4200.0,
      feeRate: '1.7% a.m.',
      feeAmount: 71.4,
      netAnticipated: 4128.6,
      status: 'Disponível para Antecipar',
    },
    {
      id: 'rec-2',
      description: 'Priscila Barreto • App Mobile (10x)',
      originalDate: 'Parcelas 2 a 10',
      amount: 8500.0,
      feeRate: '1.7% a.m.',
      feeAmount: 144.5,
      netAnticipated: 8355.5,
      status: 'Disponível para Antecipar',
    },
  ];

  const totalAvailable = 12700.0;
  const totalNet = 12484.1;

  const handleAnticipate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmWithdraw(-totalNet);
      onShowToast(
        `Antecipação NextPay de R$ ${totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} aprovada! Saldo liberado na sua conta em até 2 dias úteis.`,
      );
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg space-y-space-lg max-w-[1540px] mx-auto w-full">
        {/* Header */}
        <div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
              NextPay Crédito
            </span>
            <span className="text-outline">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Antecipação de Recebíveis
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
            Antecipação de Recebíveis
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Antecipe suas vendas no cartão de crédito ou boletos e receba em até 2 dias úteis sem
            burocracia.
          </p>
        </div>

        {/* Rate Cards Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase font-semibold text-outline">
                {ANTICIPATION_RATES.credit_single.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary-fixed text-primary font-semibold">
                Cartão
              </span>
            </div>
            <div className="font-numeric-lg text-headline-sm font-bold text-on-surface">
              {ANTICIPATION_RATES.credit_single.ratePerMonth}% ao mês
            </div>
            <span className="text-xs text-secondary font-medium block mt-1">
              {ANTICIPATION_RATES.credit_single.timeDays}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase font-semibold text-outline">
                {ANTICIPATION_RATES.credit_installment.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-semibold">
                Parcelado
              </span>
            </div>
            <div className="font-numeric-lg text-headline-sm font-bold text-on-surface">
              {ANTICIPATION_RATES.credit_installment.ratePerMonth}% ao mês
            </div>
            <span className="text-xs text-secondary font-medium block mt-1">
              {ANTICIPATION_RATES.credit_installment.timeDays}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container/60">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase font-semibold text-outline">
                {ANTICIPATION_RATES.pix_boleto.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-semibold">
                Boleto / Pix
              </span>
            </div>
            <div className="font-numeric-lg text-headline-sm font-bold text-on-surface">
              {ANTICIPATION_RATES.pix_boleto.ratePerMonth}% ao mês
            </div>
            <span className="text-xs text-outline block mt-1">
              Com envio de Nota Fiscal ou contrato
            </span>
          </div>
        </div>

        {/* Available for Anticipation */}
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
            <div>
              <h2 className="font-headline-sm font-bold text-on-surface">
                Vendas Prontas para Antecipação
              </h2>
              <p className="text-xs text-on-surface-variant">
                Total disponível pré-aprovado pela análise de risco NextPay
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-outline block">Total Pré-Aprovado:</span>
              <span className="font-numeric-lg text-headline-sm font-bold text-primary">
                R$ {totalAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {receivables.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-surface-container-low rounded-xl border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-title-md font-semibold text-on-surface">{r.description}</h3>
                  <span className="text-xs text-on-surface-variant">
                    Vencimento Original: {r.originalDate}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-outline block">Valor Bruto:</span>
                    <span className="font-bold text-on-surface">
                      R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-error block">
                      Taxa de Antecipação ({r.feeRate}):
                    </span>
                    <span className="font-medium text-error">- R$ {r.feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-secondary font-semibold block">
                      Você Recebe Líquido:
                    </span>
                    <span className="font-numeric-md font-bold text-secondary">
                      R$ {r.netAnticipated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-on-surface-variant">
              Liquidação em até 2 dias úteis diretamente na conta vinculada:{' '}
              <strong>Banco 461 - NextPay I.P S.A • Ag 0001 • C/C 7342797-3</strong>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAnticipate}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-semibold text-body-md hover:bg-on-secondary-fixed-variant transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    refresh
                  </span>
                  <span>Processando Antecipação...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>
                    Antecipar Tudo (R${' '}
                    {totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
