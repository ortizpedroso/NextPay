import React, { useState } from 'react';

import { MerchantSessionBar } from './merchant/MerchantSessionBar';
import type { MerchantProfileDto } from '../lib/api/merchantProfile';
import { isDemoMode } from '../lib/demoMode';
import { NEXTPAY_ACCOUNT } from '../data/mockData';

interface HeaderProps {
  onOpenNewCharge: () => void;
  onOpenNewLink: () => void;
  onOpenSimulator: () => void;
  onOpenCheckoutPreview: () => void;
  onToggleMobileSidebar: () => void;
  onShowToast: (msg: string) => void;
  merchantProfile: MerchantProfileDto | null;
  onSessionChanged: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewCharge,
  onOpenNewLink,
  onOpenCheckoutPreview,
  onToggleMobileSidebar,
  onShowToast,
  merchantProfile,
  onSessionChanged,
}) => {
  const profileEmail = merchantProfile?.email ?? (isDemoMode() ? NEXTPAY_ACCOUNT.email : 'Faça login');
  const profileName =
    merchantProfile?.displayName ?? (isDemoMode() ? NEXTPAY_ACCOUNT.ownerName : 'Painel NextPay');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentOrg, setCurrentOrg] = useState('Estúdio Criativo Silva');

  const organizations = ['Estúdio Criativo Silva', 'Silva Tecnologia LTDA', 'NextPay Digital Hub'];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-surface-container/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-3 lg:px-space-lg">
      <div className="flex items-center gap-2 sm:gap-space-md">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Abrir menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Organization Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-lg cursor-pointer border border-surface-container/50 text-left"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">domain</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider leading-none">
                Subconta NextPay
              </span>
              <span className="font-title-md text-[13px] text-on-surface font-semibold leading-tight truncate max-w-[130px] sm:max-w-[180px]">
                {currentOrg}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              unfold_more
            </span>
          </button>

          {showOrgDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-2 z-50">
              <span className="font-label-sm text-[11px] text-outline uppercase px-2 py-1 block">
                Selecionar Subconta NextPay
              </span>
              {organizations.map((org) => (
                <button
                  key={org}
                  type="button"
                  onClick={() => {
                    setCurrentOrg(org);
                    setShowOrgDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-body-sm transition-colors flex items-center justify-between ${
                    currentOrg === org
                      ? 'bg-primary-container/10 text-primary font-semibold'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="truncate">{org}</span>
                  {currentOrg === org && (
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NextPay Badge */}
        <div className="hidden xl:flex items-center gap-space-sm px-space-md py-1 rounded-full bg-surface-container-lowest border border-surface-container shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary"></span>
          </div>
          <span className="font-label-md text-[12px] text-on-surface-variant">
            <strong className="text-secondary font-semibold">Gateway Ativo</strong> • NextPay
            Whitelabel
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Simular Venda (Disabled with Em breve) */}
        <button
          type="button"
          disabled
          title="Em breve"
          className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant/70 font-label-md text-[12px] font-semibold cursor-not-allowed opacity-75 border border-surface-container-highest"
        >
          <span className="material-symbols-outlined text-[18px]">calculate</span>
          <span>Simular Venda</span>
          <span className="text-[9px] uppercase px-1 rounded bg-surface-container-highest text-outline">
            Em breve
          </span>
        </button>

        {/* Criar Link de Pagamento */}
        <button
          type="button"
          onClick={onOpenNewLink}
          className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-primary font-label-md text-[12px] font-semibold transition-colors border border-primary/20"
          title="Criar novo link de pagamento"
        >
          <span className="material-symbols-outlined text-[18px]">link</span>
          <span>Criar Link</span>
        </button>

        {/* Criar Cobrança Button */}
        <button
          type="button"
          onClick={onOpenNewCharge}
          className="flex items-center gap-1 bg-primary text-on-primary hover:bg-primary-container px-3 py-2 rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="font-label-md text-[12px] font-semibold whitespace-nowrap">
            Criar Cobrança
          </span>
        </button>

        {/* Client Checkout Preview Button */}
        <button
          type="button"
          onClick={onOpenCheckoutPreview}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          title="Visão do Cliente (Checkout)"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            shopping_cart_checkout
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            aria-label="Alertas e Notificações Pix"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  Notificações NextPay
                </span>
              </div>
              <div className="py-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                <div className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5">
                    payments
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="font-title-md text-[12px] font-semibold text-on-surface">
                      Transação Registrada
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">
                      Cobrança emitida via gateway NextPay
                    </span>
                    <span className="text-[10px] text-outline mt-0.5">Hoje</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden xl:block max-w-md flex-1 mx-4">
          <MerchantSessionBar onSessionChanged={onSessionChanged} onShowToast={onShowToast} />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-1.5 pl-1 cursor-pointer hover:opacity-90"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shadow-xs">
              NP
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-title-md text-[12px] text-on-surface font-semibold leading-tight">
                {profileEmail}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant leading-tight">
                {profileName}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              keyboard_arrow_down
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-2 z-50">
              <div className="p-2 border-b border-surface-container">
                <p className="font-title-md text-[13px] font-semibold text-on-surface">
                  {profileName}
                </p>
                <p className="font-body-sm text-[11px] text-on-surface-variant">{profileEmail}</p>
                {merchantProfile?.merchantId ? (
                  <p className="text-[10px] text-outline font-mono mt-1">{merchantProfile.merchantId}</p>
                ) : null}
              </div>
              <div className="py-1">
                <button
                  type="button"
                  disabled
                  title="Em breve"
                  className="w-full text-left px-3 py-2 text-body-sm text-on-surface-variant/60 cursor-not-allowed flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">calculate</span>
                    <span>Simulador de Taxas</span>
                  </div>
                  <span className="text-[9px] uppercase px-1 rounded bg-surface-container-highest text-outline">
                    Em breve
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
