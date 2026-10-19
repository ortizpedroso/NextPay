import React, { useState } from 'react';
import { NEXTPAY_ACCOUNT } from '../../data/mockData';
import { requestWithdrawal } from '../../lib/api/adminOperations';
import { getAdminBearerToken } from '../../lib/api/adminSession';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onConfirmWithdraw: (amount: number) => void;
  onShowToast: (msg: string) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onConfirmWithdraw,
  onShowToast,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('18420.50');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest max-w-md w-full p-space-lg rounded-2xl shadow-2xl space-y-space-md relative border border-surface-container">
        <button
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
          onClick={onClose}
          type="button"
          title="Fechar"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Solicitar Saque Pix D+0
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Transferência para conta bancária do titular
            </p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-space-md">
          <div className="p-space-sm bg-surface-container-low rounded-xl space-y-1 border border-surface-container/60">
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Saldo disponível:</span>
              <span className="font-numeric-md font-bold text-on-surface">
                R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Conta de Destino:</span>
              <span className="font-semibold text-primary truncate max-w-[200px]">
                {NEXTPAY_ACCOUNT.bankName} ({NEXTPAY_ACCOUNT.account})
              </span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-on-surface-variant">Taxa de Saque Pix:</span>
              <span className="font-bold text-secondary">R$ 0,00 (Gratuito)</span>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Valor do Saque (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-on-surface-variant font-bold text-body-md">
                R$
              </span>
              <input
                type="text"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-surface-container-low pl-10 pr-space-md py-2.5 rounded-xl border border-surface-container text-body-md font-numeric-md font-bold focus:outline-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-space-sm text-outline text-[12px]">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Liquidação instantânea via Pix D+0 após autorização bancária.</span>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void (async () => {
                  const amount = Number.parseFloat(withdrawAmount.replace(',', '.'));
                  if (Number.isNaN(amount) || amount <= 0) {
                    onShowToast('Informe um valor de saque válido.');
                    return;
                  }

                  setIsSubmitting(true);
                  try {
                    if (getAdminBearerToken()) {
                      const result = await requestWithdrawal({
                        amountCents: Math.round(amount * 100),
                        pixKey: NEXTPAY_ACCOUNT.pixKey,
                      });
                      onShowToast(`Saque enfileirado (${result.protocol}).`);
                    } else {
                      onShowToast('Sessão admin necessária. Saque simulado localmente.');
                    }
                    onConfirmWithdraw(amount);
                    onClose();
                  } catch (error) {
                    onShowToast(
                      error instanceof Error ? error.message : 'Falha ao solicitar saque.',
                    );
                  } finally {
                    setIsSubmitting(false);
                  }
                })();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-secondary text-on-secondary font-semibold text-body-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>{isSubmitting ? 'Processando...' : 'Confirmar Transferência Pix'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
