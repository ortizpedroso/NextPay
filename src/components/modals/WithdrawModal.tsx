import React, { useState } from 'react';

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
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0 || num > availableBalance) {
      onShowToast('Informe um valor válido dentro do saldo disponível.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmWithdraw(num);
      onShowToast(
        `Saque D+0 de R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado com sucesso para o Itaú!`
      );
      onClose();
    }, 1000);
  };

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
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Transferência instantânea para o domicílio cadastrado
            </span>
          </div>
        </div>

        {/* Bank info summary */}
        <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-surface-container/60">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Banco de Destino:</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
              Itaú Unibanco (341)
            </span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Agência & Conta:</span>
            <span className="font-mono text-on-surface font-medium">Ag: 0924 • CC: 88412-9</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Chave Pix:</span>
            <span className="font-mono text-on-surface font-medium">financeiro@silva.design</span>
          </div>
          <div className="flex items-center justify-between text-body-sm pt-1 border-t border-surface-container">
            <span className="text-on-surface-variant">Prazo de Compensação:</span>
            <span className="text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              D+0 Imediato (sem taxa)
            </span>
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-space-md">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-body-sm">
              <label className="font-semibold text-on-surface">Valor a Sacar</label>
              <button
                type="button"
                onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                className="text-primary hover:underline font-label-sm text-xs font-semibold"
              >
                Sacar Tudo (R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-body-md font-bold text-on-surface-variant">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-numeric-md text-headline-sm font-bold pl-12 pr-space-md py-2.5 rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                required
              />
            </div>
            <span className="text-[11px] text-outline block">
              Saldo restante após o saque: R${' '}
              {Math.max(0, availableBalance - (parseFloat(withdrawAmount) || 0)).toLocaleString(
                'pt-BR',
                { minimumFractionDigits: 2 }
              )}
            </span>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors text-body-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-space-lg py-2.5 rounded-xl bg-secondary text-on-secondary hover:bg-on-secondary-fixed-variant transition-all font-semibold text-body-md flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Processando Pix...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
                  <span>Confirmar Saque Imediato</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
