import React, { useState } from 'react';

interface NewChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChargeCreated: (charge: {
    clientName: string;
    description: string;
    amount: number;
    method: 'Pix' | 'Cartão' | 'Boleto';
  }) => void;
  onShowToast: (msg: string) => void;
}

export const NewChargeModal: React.FC<NewChargeModalProps> = ({
  isOpen,
  onClose,
  _onChargeCreated,
  _onShowToast,
}: NewChargeModalProps & {
  _onChargeCreated?: NewChargeModalProps['onChargeCreated'];
  _onShowToast?: NewChargeModalProps['onShowToast'];
}) => {
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('350.00');
  const [method, setMethod] = useState<'Pix' | 'Cartão' | 'Boleto'>('Pix');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest max-w-lg w-full p-space-lg rounded-2xl shadow-2xl space-y-space-md relative border border-surface-container">
        <button
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
          onClick={onClose}
          type="button"
          title="Fechar"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-space-sm border-b border-surface-container pb-space-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Criar Nova Cobrança
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Emissão direta com split e liquidação na subconta NextPay
            </p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-space-sm">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Nome do Cliente / Pagador
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Amanda Silva Advocacia"
              className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl border border-surface-container text-body-md focus:outline-primary"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1">
              Descrição do Serviço / Produto
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Consultoria Mensal ou Projeto Web"
              className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl border border-surface-container text-body-md focus:outline-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Valor Bruto (R$)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl border border-surface-container text-body-md font-numeric-md font-bold focus:outline-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Forma de Pagamento
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'Pix' | 'Cartão' | 'Boleto')}
                className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl border border-surface-container text-body-md focus:outline-primary cursor-pointer"
              >
                <option value="Pix">Pix Instantâneo (D+0)</option>
                <option value="Cartão">Cartão de Crédito</option>
                <option value="Boleto">Boleto Bancário CIP</option>
              </select>
            </div>
          </div>

          <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">chat</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  Disparar no WhatsApp imediatamente
                </p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Envia fatura e QR Code com aviso amigável
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors text-body-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled
              title="Em breve (Fase 3)"
              className="px-space-lg py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant/70 cursor-not-allowed font-semibold text-body-md flex items-center gap-1.5 opacity-80"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Emitir Cobrança Agora</span>
              <span className="ml-1 text-[10px] font-bold uppercase bg-surface-container-highest px-1.5 py-0.5 rounded text-outline">
                Em breve
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
