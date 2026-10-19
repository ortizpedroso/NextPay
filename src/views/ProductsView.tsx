import React, { useState } from 'react';
import { ProductItem } from '../data/mockData';

interface ProductsViewProps {
  products: ProductItem[];
  metrics?: {
    activeProducts: number;
    ledgerTransactionCount: number;
  } | null;
  onOpenDrawer: () => void;
  onOpenCheckoutWithProduct: (product: ProductItem) => void;
  onUpdateProductPrice?: (productPublicId: string, priceCents: number) => void;
  onShowToast: (msg: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  metrics,
  onOpenDrawer,
  onOpenCheckoutWithProduct,
  onUpdateProductPrice,
  onShowToast,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = products.filter((item) => {
    // category filter
    if (selectedFilter !== 'all' && item.category !== selectedFilter) {
      return false;
    }
    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLink = (product: ProductItem) => {
    const url =
      product.checkoutUrl ??
      `https://nextpay.link/silva-design/${product.id.replace(/^np_prod_/, '')}`;
    navigator.clipboard.writeText(url);
    onShowToast(`Link de pagamento para "${product.title}" copiado com sucesso!`);
  };

  const handleAdjustPrice = (product: ProductItem) => {
    if (!onUpdateProductPrice) {
      onShowToast('Conecte a sessão do painel para editar preços.');
      return;
    }
    const raw = window.prompt(
      `Novo preço em centavos para "${product.title}" (atual: ${Math.round(product.price * 100)}):`,
      String(Math.round(product.price * 100)),
    );
    if (!raw) {
      return;
    }
    const priceCents = Number.parseInt(raw, 10);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      onShowToast('Informe um valor inteiro válido em centavos.');
      return;
    }
    onUpdateProductPrice(product.id, priceCents);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 lg:p-space-lg max-w-[1540px] mx-auto w-full flex flex-col gap-space-lg">
        {/* Top Command & Metric Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Itens no Catálogo
              </span>
              <span className="font-numeric-lg text-numeric-lg text-on-surface mt-space-xs font-bold">
                {metrics?.activeProducts ?? products.length} ativos
              </span>
              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">database</span>
                {metrics?.ledgerTransactionCount ?? 0} vendas no ledger
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Receita Recorrente (MRR)
              </span>
              <span className="font-numeric-lg text-numeric-lg text-on-surface mt-space-xs font-bold">
                R$ 14.820,00
              </span>
              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">sync</span> 39 assinaturas
                ativas
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">autorenew</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Conversão de Links
              </span>
              <span className="font-numeric-lg text-numeric-lg text-on-surface mt-space-xs font-bold">
                42,8%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Liquidação D+0
                Pix
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">query_stats</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Checkout Transparente
              </span>
              <span className="font-numeric-lg text-numeric-lg text-secondary mt-space-xs font-bold">
                Status Seguro
              </span>
              <span className="font-body-sm text-body-sm text-outline flex items-center gap-space-xs mt-0.5">
                <span className="material-symbols-outlined text-[14px]">lock</span> TLS 1.3 /
                NextPay Shield
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
        </div>

        {/* Header Section with Title, Filters and Main Action */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
                NextPay Hub
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Gestão de Portfólio
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-0.5">
              Produtos, Serviços & Planos Recorrentes
            </h1>
          </div>

          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-sm rounded-lg shadow-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] font-label-md text-label-md font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Novo Produto ou Serviço</span>
          </button>
        </div>

        {/* Controls Ribbon: Search, Filter Tabs & Display Controls */}
        <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm border border-surface-container/60">
          <div className="flex items-center gap-space-xs flex-1 max-w-md bg-surface-container-low rounded-lg px-space-sm py-1.5 border border-surface-container">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input
              type="text"
              placeholder="Buscar por título, SKU ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-on-surface font-body-md text-body-md placeholder:text-outline"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Segmented Category Filters */}
          <div className="flex items-center overflow-x-auto gap-space-xs py-0.5">
            {[
              { id: 'all', label: `Todos (${products.length})` },
              { id: 'servicos', label: 'Serviços Profissionais' },
              { id: 'digitais', label: 'Produtos Digitais & Físicos' },
              { id: 'recorrentes', label: 'Assinaturas Recorrentes' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setSelectedFilter(btn.id)}
                className={`px-space-sm py-1 rounded-md font-label-md text-label-md transition-colors whitespace-nowrap font-medium ${
                  selectedFilter === btn.id
                    ? 'bg-primary-container text-on-primary shadow-xs font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Grid/List switch */}
          <div className="flex items-center gap-space-xs self-end md:self-auto">
            <span className="font-label-sm text-label-sm text-outline mr-1">Exibição:</span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface-container text-primary'
                  : 'text-outline hover:bg-surface-container-high'
              }`}
              title="Exibição em Grade"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface-container text-primary'
                  : 'text-outline hover:bg-surface-container-high'
              }`}
              title="Exibição em Lista"
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>

        {/* Catalog Grid / List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative border border-surface-container/60"
              >
                <div className="relative w-full h-44 overflow-hidden bg-surface-container">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-space-sm left-space-sm flex items-center gap-space-xs">
                    <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-label-sm uppercase tracking-wide font-semibold shadow-xs">
                      {product.categoryLabel}
                    </span>
                    {product.badge && (
                      <span className="px-space-xs py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase font-semibold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-space-sm right-space-sm">
                    <button
                      type="button"
                      onClick={() => onOpenCheckoutWithProduct(product)}
                      className="h-8 px-2.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary hover:text-on-primary hover:bg-primary text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      title="Ver página de checkout que o cliente recebe"
                    >
                      <span className="material-symbols-outlined text-[14px]">preview</span>
                      <span>Checkout</span>
                    </button>
                  </div>
                </div>

                <div className="p-space-md flex flex-col flex-1 justify-between gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <h2 className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors line-clamp-1 font-semibold">
                      {product.title}
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container/60">
                    <div className="flex items-baseline justify-between">
                      <span className="font-label-sm text-label-sm text-outline">
                        {product.billingType === 'recorrente' ? 'Recorrência Mensal' : 'Preço Base'}
                      </span>
                      <span className="font-numeric-lg text-headline-sm text-on-surface font-bold">
                        {product.priceFormatted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          qr_code_2
                        </span>{' '}
                        Pix instantâneo
                      </span>
                      <span>{product.installmentsText}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs pt-1">
                    <div className="flex items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-sm py-2 rounded-lg font-label-md text-label-md transition-colors font-semibold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span>Gerar Link</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustPrice(product)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors"
                        title="Ajustar preço (PATCH catálogo)"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                    <span className="text-center font-label-sm text-label-sm text-outline">
                      {product.statsText}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* List Mode */
          <div className="bg-surface-container-lowest rounded-xl shadow-sm divide-y divide-surface-container border border-surface-container/60">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md hover:bg-surface-container-low/50 transition-colors"
              >
                <div className="flex items-center gap-space-md">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover border border-surface-container"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-surface-container text-primary font-semibold">
                        {product.categoryLabel}
                      </span>
                      <h3 className="font-title-md font-semibold text-on-surface">
                        {product.title}
                      </h3>
                    </div>
                    <p className="font-body-sm text-on-surface-variant line-clamp-1 max-w-lg mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-lg self-end sm:self-center">
                  <div className="text-right">
                    <span className="font-numeric-lg text-headline-sm font-bold text-on-surface block">
                      {product.priceFormatted}
                    </span>
                    <span className="font-body-sm text-outline">{product.installmentsText}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(product)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      <span>Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCheckoutWithProduct(product)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
