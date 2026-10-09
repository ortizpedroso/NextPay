import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItemsManagement = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'cobrancas-e-links', label: 'Cobranças & Links', icon: 'receipt_long' },
    { id: 'produtos-e-servicos', label: 'Produtos & Serviços', icon: 'inventory_2' },
    { id: 'assinaturas', label: 'Assinaturas (Recorrência)', icon: 'autorenew' },
  ];

  const navItemsInfra = [
    { id: 'integracoes-e-api', label: 'Integrações & API', icon: 'terminal' },
    { id: 'configuracoes-de-taxas', label: 'Configurações de Taxas', icon: 'percent' },
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    if (isOpenMobile) {
      onCloseMobile();
    }
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
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Header */}
          <div className="h-16 px-space-lg flex items-center justify-between gap-space-sm bg-surface-container-lowest border-b border-surface-container/60">
            <div className="flex items-center gap-space-sm">
              <img
                alt="NexusPay Whitelabel Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XMArOepH1e8o2fORO-HqszsOWteSXxsDxN8DoRyGng4xm8u1E-xoe1-ZDxHPMaXyfiXq_1SWq7C_yY02Hp1rXuYS-mSE_LSUBvciQdqAs8NzF-zlIoR_d97yCLPJl1uRRZt8CimwpCa1_onXHMw-goSA6fnwfIW4zlYCjvMc4furk1vgJCj8HHG3F7M9nkbbrjirI00okquvvntgSsUP8MNOLOcM-crCPNDgmDl-j-ciPxgc-6cClZFw"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight leading-none">
                  NexusPay
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-0.5">
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

          {/* Section: Gestão & Vendas */}
          <div className="px-space-md pt-space-md">
            <div className="px-space-sm pb-space-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Gestão & Vendas
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navItemsManagement.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-left transition-colors font-body-md text-body-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Infraestrutura */}
          <div className="px-space-md pt-space-lg">
            <div className="px-space-sm pb-space-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Infraestrutura
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navItemsInfra.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-left transition-colors font-body-md text-body-md ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="p-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                Liquidação Pix
              </span>
              <span className="font-label-sm text-label-sm text-secondary font-bold">
                D+0 Ativo
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">
                Repasse Automático
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
