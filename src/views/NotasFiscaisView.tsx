import React, { useState } from 'react';

import { hasDashboardSession } from '../lib/api/dashboardAuth';
import { parseBRLToCents } from '../lib/format';
import { requestNotaFiscalEmit } from '../lib/api/p2Services';

export const NotasFiscaisView: React.FC<{ onShowToast: (msg: string) => void }> = ({
  onShowToast,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [amountBrl, setAmountBrl] = useState('250,00');
  const [description, setDescription] = useState('Serviços de design');

  return (
    <div className="p-space-lg max-w-3xl mx-auto space-y-space-md">
      <h1 className="font-headline-lg text-headline-lg">Notas fiscais</h1>
      <p className="text-on-surface-variant">Solicitação de emissão (stub). NF-e real exige provedor fiscal.</p>
      <input
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        placeholder="Cliente"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
      <input
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        placeholder="CPF/CNPJ"
        value={customerDocument}
        onChange={(e) => setCustomerDocument(e.target.value)}
      />
      <input
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        placeholder="Valor R$"
        value={amountBrl}
        onChange={(e) => setAmountBrl(e.target.value)}
      />
      <textarea
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold"
        onClick={() => {
          void (async () => {
            if (!hasDashboardSession()) {
              onShowToast('Faça login para emitir NF.');
              return;
            }
            try {
              const amountCents = parseBRLToCents(amountBrl.replace(/^R\$\s?/, ''));
              const { request } = await requestNotaFiscalEmit({
                customerName: customerName.trim(),
                customerDocument: customerDocument.trim(),
                amountCents,
                description: description.trim(),
              });
              onShowToast(`${request.message} Protocolo ${request.protocol}.`);
            } catch (error) {
              onShowToast(error instanceof Error ? error.message : 'Falha na emissão.');
            }
          })();
        }}
      >
        Solicitar emissão
      </button>
    </div>
  );
};
