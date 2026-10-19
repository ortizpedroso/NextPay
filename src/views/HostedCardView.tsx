import React, { useEffect, useState } from 'react';

import { confirmHostedCard, fetchHostedCard } from '../lib/api/hostedCard';

interface HostedCardViewProps {
  token: string;
  onShowToast: (msg: string) => void;
}

export const HostedCardView: React.FC<HostedCardViewProps> = ({ token, onShowToast }) => {
  const [loading, setLoading] = useState(true);
  const [brandLabel, setBrandLabel] = useState('NextPay');
  const [amountCents, setAmountCents] = useState(0);
  const [description, setDescription] = useState('');
  const [last4, setLast4] = useState('');
  const [brand, setBrand] = useState('Visa');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    void fetchHostedCard(token)
      .then((hosted) => {
        setBrandLabel(hosted.brandLabel);
        setAmountCents(hosted.amountCents);
        setDescription(hosted.description);
        setConfirmed(hosted.confirmed);
      })
      .catch((error: Error) => onShowToast(error.message))
      .finally(() => setLoading(false));
  }, [token, onShowToast]);

  const handleConfirm = async () => {
    if (!/^\d{4}$/.test(last4)) {
      onShowToast('Informe apenas os 4 últimos dígitos do cartão.');
      return;
    }
    try {
      const result = await confirmHostedCard(token, last4, brand);
      setConfirmed(true);
      onShowToast(result.message);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Erro ao confirmar.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        Carregando checkout seguro…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-surface-container bg-surface-container-lowest shadow-lg p-6 space-y-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-outline">{brandLabel}</p>
          <h1 className="text-xl font-bold text-on-surface mt-1">Pagamento com cartão</h1>
          <p className="text-sm text-on-surface-variant mt-2">{description}</p>
          <p className="text-2xl font-bold text-primary mt-3">
            R${' '}
            {(amountCents / 100).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <p className="text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">
          Ambiente white-label: o número completo do cartão não é enviado ao NextPay. Este fluxo
          stub simula apenas tokenização via últimos 4 dígitos.
        </p>

        {confirmed ? (
          <div className="text-center text-secondary font-medium py-4">
            Token registrado. Você pode fechar esta janela.
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-on-surface-variant">
              Últimos 4 dígitos
              <input
                className="mt-1 w-full rounded-lg border border-outline/30 px-3 py-2 text-sm"
                inputMode="numeric"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </label>
            <label className="block text-xs font-medium text-on-surface-variant">
              Bandeira
              <select
                className="mt-1 w-full rounded-lg border border-outline/30 px-3 py-2 text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              className="w-full rounded-xl bg-primary text-on-primary py-3 font-semibold text-sm"
            >
              Confirmar pagamento seguro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
