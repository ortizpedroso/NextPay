import React from 'react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  amount?: string;
  method?: string;
  code?: string;
  onShowToast: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  clientName = 'Estúdio Criativo Silva',
  amount = 'R$ 4.250,00',
  method = 'Transferência Pix Automática D+0',
  code = '#NEXTPAY-LIQ-9842109',
  onShowToast,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    onShowToast('Comprovante enviado para impressão / download PDF');
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

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-secondary-container/40 text-secondary mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">verified</span>
          </div>
          <span className="font-label-sm text-secondary font-bold uppercase tracking-wider block">
            Liquidação Autenticada
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Comprovante de Pagamento
          </h3>
          <p className="font-numeric-lg text-[26px] font-bold text-on-surface">{amount}</p>
        </div>

        <div className="bg-surface-container-low p-space-md rounded-xl space-y-2.5 text-body-sm border border-surface-container/70">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Protocolo NextPay:</span>
            <span className="font-mono text-on-surface font-semibold">{code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Favorecido / Destino:</span>
            <span className="text-on-surface font-medium">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Instituição Financeira:</span>
            <span className="text-on-surface font-medium">Banco Itaú Unibanco (341)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Agência / Conta:</span>
            <span className="text-on-surface font-mono">Ag 0924 • CC 88412-9</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Tipo de Transação:</span>
            <span className="text-secondary font-medium">{method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Status da Liquidação:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span> Efetivada em D+0
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-surface-container">
            <span className="text-on-surface-variant">Autenticação Digital:</span>
            <span className="font-mono text-[10px] text-outline truncate max-w-[190px]">
              E3F4.98A1.BC02.8841.7712.FA90
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-body-sm flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Baixar PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-body-sm transition-all"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
