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
  onChargeCreated,
  onShowToast,
}) => {
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('350.00');
  const [method, setMethod] = useState<'Pix' | 'Cartão' | 'Boleto'>('Pix');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!clientName.trim() || !description.trim() || isNaN(num) || num <= 0) {
      onShowToast('Preencha os campos obrigatórios corretamente.');
      return;
    }

    onChargeCreated({
      clientName: clientName.trim(),
      description: description.trim(),
      amount: num,
      method,
    });

    onShowToast(`Cobrança de R$ ${num.toFixed(2)} criada para ${clientName}!`);
    if (sendWhatsApp) {
      setTimeout(() => {
        onShowToast(`Lembrete e fatura disparados via WhatsApp para ${clientName}`);
      }, 700);
    }
    onClose();
  };

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

        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Criar Nova Cobrança
            </h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Emissão expressa via Pix D+0, Cartão ou Boleto
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div className="space-y-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Cliente ou Empresa <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Studio Alpha, Mariana Albuquerque..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface px-space-md py-2.5 rounded-xl border border-surface-container focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Descrição do Serviço / Item <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Consultoria Estratégica, Design System..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface px-space-md py-2.5 rounded-xl border border-surface-container focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all text-body-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="space-y-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Valor (R$) <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-on-surface-variant font-bold text-body-md">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface pl-10 pr-space-md py-2.5 rounded-xl border border-surface-container focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none font-numeric-md font-bold text-body-md transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md font-semibold text-on-surface">
                Método Principal
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-surface-container-low text-on-surface px-space-md py-2.5 rounded-xl border border-surface-container focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none text-body-md transition-all"
              >
                <option value="Pix">Pix Dinâmico (D+0)</option>
                <option value="Cartão">Cartão de Crédito</option>
                <option value="Boleto">Boleto Bancário</option>
              </select>
            </div>
          </div>

          {/* Quick automation toggle */}
          <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between border border-surface-container/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">chat</span>
              <div>
                <p className="font-title-md text-[13px] text-on-surface font-semibold">
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
              type="submit"
              className="px-space-lg py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-semibold text-body-md flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Emitir Cobrança Agora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
