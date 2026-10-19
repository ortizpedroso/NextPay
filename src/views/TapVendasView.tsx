import React, { useState } from 'react';

import { hasDashboardSession } from '../lib/api/dashboardAuth';
import { registerTapDevice } from '../lib/api/p2Services';

export const TapVendasView: React.FC<{ onShowToast: (msg: string) => void }> = ({
  onShowToast,
}) => {
  const [label, setLabel] = useState('Terminal Loja 01');
  const [serial, setSerial] = useState('');
  const [lastDeviceId, setLastDeviceId] = useState<string | null>(null);

  return (
    <div className="p-space-lg max-w-3xl mx-auto space-y-space-md">
      <h1 className="font-headline-lg text-headline-lg">Vendas físicas (Tap to Pay)</h1>
      <p className="text-on-surface-variant">
        Registro de dispositivo simulado. Hardware Tap exige certificação do adquirente.
      </p>
      <input
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nome do terminal"
      />
      <input
        className="w-full px-3 py-2 rounded-lg border border-surface-container"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        placeholder="Número de série (opcional)"
      />
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-semibold"
        onClick={() => {
          void (async () => {
            if (!hasDashboardSession()) {
              onShowToast('Faça login para registrar terminal.');
              return;
            }
            try {
              const { device } = await registerTapDevice({
                label: label.trim(),
                serialNumber: serial.trim() || undefined,
              });
              setLastDeviceId(device.devicePublicId);
              onShowToast(`Dispositivo ${device.devicePublicId} registrado (stub).`);
            } catch (error) {
              onShowToast(error instanceof Error ? error.message : 'Falha no registro.');
            }
          })();
        }}
      >
        Registrar dispositivo
      </button>
      {lastDeviceId ? <p className="text-body-sm font-mono">Último ID: {lastDeviceId}</p> : null}
    </div>
  );
};
