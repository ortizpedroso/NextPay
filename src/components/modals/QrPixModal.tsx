import React, { useState } from 'react';

interface QrPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: string;
  onShowToast: (msg: string) => void;
}

export const QrPixModal: React.FC<QrPixModalProps> = ({
  isOpen,
  onClose,
  title,
  price,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pixCode =
    '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-42661417400052040000530398654051500.005802BR5925Estudio Criativo Silva6009Sao Paulo62070503***6304E2CA';

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    onShowToast('Código Pix Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest max-w-sm w-full p-space-lg rounded-2xl shadow-2xl space-y-space-md text-center relative border border-surface-container">
        <button
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
          onClick={onClose}
          type="button"
          title="Fechar"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="space-y-1">
          <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
            Pix Dinâmico Instantâneo
          </span>
          <h3 className="font-title-md text-title-md font-bold text-on-surface">{title}</h3>
          <p className="font-numeric-lg text-numeric-lg font-bold text-on-surface">{price}</p>
        </div>

        {/* SVG QR Code */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container inline-block shadow-sm">
          <svg className="w-44 h-44 mx-auto" fill="currentColor" viewBox="0 0 100 100">
            <rect className="text-on-surface" height="30" rx="3" width="30" x="0" y="0"></rect>
            <rect fill="white" height="20" rx="2" width="20" x="5" y="5"></rect>
            <rect className="text-on-surface" height="10" rx="1" width="10" x="10" y="10"></rect>
            <rect className="text-on-surface" height="30" rx="3" width="30" x="70" y="0"></rect>
            <rect fill="white" height="20" rx="2" width="20" x="75" y="5"></rect>
            <rect className="text-on-surface" height="10" rx="1" width="10" x="80" y="10"></rect>
            <rect className="text-on-surface" height="30" rx="3" width="30" x="0" y="70"></rect>
            <rect fill="white" height="20" rx="2" width="20" x="5" y="75"></rect>
            <rect className="text-on-surface" height="10" rx="1" width="10" x="10" y="80"></rect>
            <rect className="text-on-surface" height="6" width="6" x="36" y="8"></rect>
            <rect className="text-on-surface" height="6" width="8" x="46" y="14"></rect>
            <rect className="text-on-surface" height="8" width="6" x="58" y="6"></rect>
            <rect className="text-secondary" height="20" rx="2" width="20" x="40" y="38"></rect>
            <rect className="text-on-surface" height="8" width="8" x="66" y="44"></rect>
            <rect className="text-on-surface" height="12" width="6" x="78" y="52"></rect>
            <rect className="text-on-surface" height="8" width="8" x="36" y="68"></rect>
            <rect className="text-on-surface" height="6" width="10" x="52" y="78"></rect>
            <rect className="text-on-surface" height="6" width="14" x="70" y="84"></rect>
          </svg>
        </div>

        <div className="space-y-space-xs text-left">
          <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
            Pix Copia e Cola:
          </label>
          <div className="flex items-center gap-1 bg-surface-container-low p-2 rounded-lg border border-surface-container">
            <input
              className="text-[11px] font-mono text-on-surface bg-transparent w-full overflow-ellipsis outline-none"
              readOnly
              value={pixCode}
            />
            <button
              className="text-primary hover:text-primary-container p-1 shrink-0"
              onClick={handleCopy}
              type="button"
              title="Copiar Código"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full py-2.5 bg-surface-container-high text-on-surface-variant/70 rounded-xl font-title-md text-body-md font-semibold cursor-not-allowed opacity-80 flex items-center justify-center gap-1.5"
            disabled
            title="Em breve (Fase 1)"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Aguardando Confirmação Pix</span>
            <span className="text-[10px] uppercase px-1 rounded bg-surface-container-highest text-outline font-semibold">
              Em breve
            </span>
          </button>
          <button
            className="w-full py-2 bg-surface-container-low text-on-surface rounded-xl font-title-md text-body-md font-medium hover:bg-surface-container transition-all"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
