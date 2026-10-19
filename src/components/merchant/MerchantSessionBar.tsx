import React, { useState } from 'react';

import { clearMerchantJwt, getMerchantJwt, loginMerchant } from '../../lib/api/merchantSession';

interface MerchantSessionBarProps {
  onSessionChanged: () => void;
  onShowToast: (message: string) => void;
}

export const MerchantSessionBar: React.FC<MerchantSessionBarProps> = ({
  onSessionChanged,
  onShowToast,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSession = Boolean(getMerchantJwt());

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginMerchant(email.trim(), password);
      setPassword('');
      onSessionChanged();
      onShowToast('Sessão do lojista iniciada.');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Falha no login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearMerchantJwt();
    onSessionChanged();
    onShowToast('Sessão do lojista encerrada.');
  };

  return (
    <div className="p-space-md rounded-xl border border-surface-container bg-surface-container-low flex flex-col gap-space-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-title-md text-title-md font-semibold text-on-surface">
            Sessão do lojista (JWT)
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Login com e-mail e senha configurados em{' '}
            <code className="text-xs">MERCHANT_LOGIN_*</code> no servidor.
          </p>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            hasSession
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {hasSession ? 'Autenticado' : 'Pendente'}
        </span>
      </div>

      {!hasSession ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail do lojista"
            className="px-space-md py-2 rounded-lg border border-surface-container bg-surface-container-lowest text-body-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="px-space-md py-2 rounded-lg border border-surface-container bg-surface-container-lowest text-body-sm"
          />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleLogin()}
            className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-sm disabled:opacity-60"
          >
            Entrar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleLogout}
          className="self-start px-space-md py-2 rounded-lg border border-outline text-body-sm font-semibold"
        >
          Sair
        </button>
      )}
    </div>
  );
};
