import React, { useState } from 'react';

import {
  clearAdminBearerToken,
  getAdminBearerToken,
  setAdminBearerToken,
} from '../../lib/api/adminSession';

interface AdminSessionBarProps {
  onSessionChanged: () => void;
  onShowToast: (message: string) => void;
}

export const AdminSessionBar: React.FC<AdminSessionBarProps> = ({
  onSessionChanged,
  onShowToast,
}) => {
  const [draftToken, setDraftToken] = useState('');
  const hasSession = Boolean(getAdminBearerToken());

  const handleSave = () => {
    if (draftToken.trim().length < 16) {
      onShowToast('Informe um token administrativo válido (mín. 16 caracteres).');
      return;
    }
    setAdminBearerToken(draftToken);
    setDraftToken('');
    onSessionChanged();
    onShowToast('Sessão administrativa configurada neste navegador.');
  };

  const handleClear = () => {
    clearAdminBearerToken();
    onSessionChanged();
    onShowToast('Sessão administrativa removida.');
  };

  return (
    <div className="p-space-md rounded-xl border border-surface-container bg-surface-container-low flex flex-col gap-space-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">
          admin_panel_settings
        </span>
        <div>
          <h3 className="font-title-md text-title-md font-semibold text-on-surface">
            Acesso administrativo (sessão)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Use o token definido em <code className="text-xs">ADMIN_API_TOKEN</code> no servidor.
            Fica apenas no <strong>sessionStorage</strong> desta aba.
          </p>
        </div>
        <span
          className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${
            hasSession
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {hasSession ? 'Autenticado' : 'Pendente'}
        </span>
      </div>

      {!hasSession && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={draftToken}
            onChange={(e) => setDraftToken(e.target.value)}
            placeholder="Bearer administrativo (servidor)"
            className="flex-1 px-space-md py-2 rounded-lg border border-surface-container bg-surface-container-lowest text-body-sm"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-sm"
          >
            Ativar sessão admin
          </button>
        </div>
      )}

      {hasSession && (
        <button
          type="button"
          onClick={handleClear}
          className="self-start px-space-sm py-1.5 rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-high"
        >
          Encerrar sessão admin
        </button>
      )}
    </div>
  );
};
