import React, { useState } from 'react';

import { parseBRLToCents } from '../lib/format';
import { getMerchantJwt } from '../lib/api/merchantSession';

interface SimularVendaViewProps {
  onShowToast: (msg: string) => void;
}

export const SimularVendaView: React.FC<SimularVendaViewProps> = ({ onShowToast }) => {
  const [amountInput, setAmountInput] = useState('R$ 150,00');
  const [description, setDescription] = useState('Venda simulada sandbox');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const amountCents = parseBRLToCents(amountInput.replace(/^R\$\s?/, ''));
      const token = getMerchantJwt();
      if (!token) {
        onShowToast('Faça login no painel para simular vendas.');
        return;
      }
      const response = await fetch('/api/v1/sandbox/simulate-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amountCents, description }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Falha na simulação.');
      }
      const json = (await response.json()) as { paymentId: string };
      onShowToast(`Venda simulada registrada (${json.paymentId}).`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Erro na simulação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-lg font-bold text-on-surface mb-2">Simular venda (sandbox)</h2>
      <p className="text-sm text-on-surface-variant mb-4">
        Credita uma transação Pix simulada no ledger local. Disponível apenas fora de produção real.
      </p>
      <div className="space-y-3">
        <label className="block text-xs font-medium">
          Valor
          <input
            className="mt-1 w-full rounded-lg border border-outline/30 px-3 py-2 text-sm"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
        </label>
        <label className="block text-xs font-medium">
          Descrição
          <input
            className="mt-1 w-full rounded-lg border border-outline/30 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleSimulate()}
          className="rounded-xl bg-secondary text-on-secondary px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? 'Simulando…' : 'Simular venda'}
        </button>
      </div>
    </div>
  );
};
