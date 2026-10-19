import React, { useState } from 'react';

import { hasDashboardSession } from '../lib/api/dashboardAuth';
import { formatBRL } from '../lib/format';
import { quoteAntecipacao } from '../lib/api/p2Services';

export const AntecipacaoView: React.FC<{ onShowToast: (msg: string) => void }> = ({
  onShowToast,
}) => {
  const [amountBrl, setAmountBrl] = useState('10000,00');
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteAntecipacao>>['quote'] | null>(
    null,
  );

  return (
    <div className="p-space-lg max-w-3xl mx-auto space-y-space-md">
      <h1 className="font-headline-lg text-headline-lg">Antecipação de recebíveis</h1>
      <p className="text-on-surface-variant text-body-md">
        Cotação simulada (stub). Produção exige contrato de antecipação com o processador.
      </p>
      <label className="block text-body-sm">
        Valor a antecipar (R$)
        <input
          className="mt-1 w-full px-3 py-2 rounded-lg border border-surface-container"
          value={amountBrl}
          onChange={(e) => setAmountBrl(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold"
        onClick={() => {
          void (async () => {
            if (!hasDashboardSession()) {
              onShowToast('Faça login para cotar antecipação.');
              return;
            }
            const normalized = amountBrl.replace(/\./g, '').replace(',', '.');
            const cents = Math.round(Number.parseFloat(normalized) * 100);
            if (Number.isNaN(cents) || cents <= 0) {
              onShowToast('Informe um valor válido.');
              return;
            }
            try {
              const result = await quoteAntecipacao(cents);
              setQuote(result.quote);
            } catch (error) {
              onShowToast(error instanceof Error ? error.message : 'Erro na cotação.');
            }
          })();
        }}
      >
        Simular cotação
      </button>
      {quote ? (
        <div className="p-space-md rounded-xl border border-surface-container bg-surface-container-low space-y-2">
          <div>Bruto: {formatBRL(quote.receivableCents)}</div>
          <div>
            Taxa ({quote.feePercent}%): {formatBRL(quote.feeCents)}
          </div>
          <div className="font-bold">Líquido: {formatBRL(quote.netCents)}</div>
          <div className="text-body-sm text-outline">
            Prazo estimado: {quote.settlementEtaHours}h
          </div>
        </div>
      ) : null}
    </div>
  );
};
