import React, { useState } from 'react';
import type { MerchantProfileDto } from '../lib/api/merchantProfile';
import { isDemoMode } from '../lib/demoMode';
import { NEXTPAY_ACCOUNT } from '../data/mockData';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  availableBalance: number;
  merchantProfile: MerchantProfileDto | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  availableBalance,
  merchantProfile,
}) => {
  const accountEmail = merchantProfile?.email ?? (isDemoMode() ? NEXTPAY_ACCOUNT.email : '—');
  const displayName =
    merchantProfile?.displayName ?? (isDemoMode() ? NEXTPAY_ACCOUNT.companyName : 'Lojista');
  const [showBalance, setShowBalance] = useState(true);

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Início', icon: 'grid_view' },
    { id: 'clientes', label: 'Meus Clientes', icon: 'group' },
    { id: 'cobrancas-e-links', label: 'Cobranças', icon: 'receipt_long' },
    { id: 'links-pagamento', label: 'Links de Pagamento', icon: 'link' },
    { id: 'simular-venda', label: 'Simular Venda', icon: 'calculate' },
    { id: 'pix', label: 'Pix Instantâneo', icon: 'qr_code_2' },
    { id: 'produtos-e-servicos', label: 'Produtos & Serviços', icon: 'inventory_2' },
    { id: 'assinaturas', label: 'Assinaturas (Recorrência)', icon: 'autorenew' },
    { id: 'vendas-fisicas', label: 'Vendas Físicas (Tap)', icon: 'contactless' },
  ];

  const financialNav: NavItem[] = [
    { id: 'antecipacoes', label: 'Antecipações', icon: 'bolt' },
    { id: 'cartao-nextpay', label: 'Cartão NextPay', icon: 'credit_card', disabled: true },
    { id: 'pague-contas', label: 'Pague Contas', icon: 'barcode_scanner', disabled: true },
    { id: 'recarga-celular', label: 'Recarga de Celular', icon: 'smartphone', disabled: true },
    { id: 'notas-fiscais', label: 'Notas Fiscais', icon: 'description' },
    {
      id: 'serasa',
      label: 'Consulta Serasa & Negativação',
      icon: 'policy',
      disabled: true,
    },
    { id: 'open-finance', label: 'Open Finance', icon: 'account_tree', disabled: true },
  ];

  const toolsNav: NavItem[] = [
    { id: 'configuracoes-de-taxas', label: 'Taxas & Prazos', icon: 'percent' },
    { id: 'integracoes-e-api', label: 'Integrações & API', icon: 'terminal' },
    { id: 'loja-nextpay', label: 'Loja NextPay', icon: 'storefront', disabled: true },
    { id: 'beneficios', label: 'Benefícios & Indique', icon: 'loyalty', disabled: true },
  ];

  const handleNav = (item: NavItem) => {
    if (item.disabled) return;
    onNavigate(item.id);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  const renderNavItem = (item: NavItem) => {
    if (item.disabled) {
      return (
        <div
          key={item.id}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left font-body-md text-xs text-on-surface-variant/50 cursor-not-allowed select-none opacity-60"
          title="Em breve"
          aria-disabled="true"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-surface-container-high text-on-surface-variant/80 font-medium tracking-tight">
            Em breve
          </span>
        </div>
      );
    }

    const isActive = currentView === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNav(item)}
        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors font-body-md text-xs ${
          isActive
            ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-surface-container ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding with NextPay */}
        <div className="flex flex-col flex-shrink-0">
          <div className="h-20 px-space-md flex flex-col justify-center bg-surface-container-lowest border-b border-surface-container/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* NextPay Modern Brandmark */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center text-white shadow-sm font-bold text-base">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none font-bold">
                    NextPay
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">
                    Whitelabel
                  </span>
                </div>
              </div>

              {/* Mobile close button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                title="Fechar menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* NextPay Status */}
            <div className="mt-1.5 flex items-center justify-between px-2 py-0.5 rounded bg-surface-container-low border border-surface-container/60">
              <span className="text-[10px] text-outline font-medium">Gateway:</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                <span className="text-[11px] font-bold text-secondary tracking-tight">NextPay</span>
                <span className="text-[9px] text-outline">v1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-space-md py-3 space-y-4">
          {/* Quick Balance Peek */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-outline text-[11px] font-medium">
              <span>Saldo em conta</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-on-surface"
                title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showBalance ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <div className="font-numeric-lg text-lg font-bold text-on-surface">
              {showBalance
                ? `R$ ${availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : '••••••'}
            </div>
          </div>

          {/* Central de Navegação */}
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold block px-2 mb-1">
              Central de Navegação
            </span>
            <nav className="flex flex-col gap-0.5">{mainNav.map(renderNavItem)}</nav>
          </div>

          {/* Serviços Financeiros */}
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold block px-2 mb-1">
              Serviços Financeiros
            </span>
            <nav className="flex flex-col gap-0.5">{financialNav.map(renderNavItem)}</nav>
          </div>

          {/* Infraestrutura & Apps */}
          <div>
            <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-semibold block px-2 mb-1">
              Infraestrutura & Apps
            </span>
            <nav className="flex flex-col gap-0.5">{toolsNav.map(renderNavItem)}</nav>
          </div>
        </div>

        {/* User Account Card */}
        <div className="p-3 border-t border-surface-container bg-surface-container-low/70 flex-shrink-0">
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-on-surface truncate">{accountEmail}</span>
              <span className="px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container text-[9px] font-bold">
                Verificado
              </span>
            </div>
            <div className="text-on-surface-variant text-[10px] leading-tight">
              <span>{displayName}</span>
            </div>
            <div className="flex items-center justify-between text-outline text-[10px]">
              <span>
                ID: <strong>{merchantProfile?.merchantId ?? '—'}</strong>
              </span>
              <span>
                Saldo API:{' '}
                <strong>
                  R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
