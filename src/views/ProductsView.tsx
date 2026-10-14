import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ProductData } from '../api/client';
import { ProductDrawer } from '../components/ProductDrawer';

interface ProductsViewProps {
  onOpenCheckoutWithProduct: (product: ProductData) => void;
  onShowToast: (msg: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenCheckoutWithProduct,
  onShowToast,
}) => {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', { page, pageSize, q: searchQuery, category: selectedFilter }],
    queryFn: () =>
      api.getProducts({
        page,
        pageSize,
        q: searchQuery,
        category: selectedFilter !== 'all' ? selectedFilter : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: Partial<ProductData>) => api.createProduct(newProduct),
    onSuccess: (prod) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDrawerOpen(false);
      onShowToast(`Produto "${prod.title}" cadastrado com sucesso!`);
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao cadastrar produto: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onShowToast('Produto excluído com sucesso!');
    },
    onError: (err: Error) => {
      onShowToast(`Erro ao excluir produto: ${err.message}`);
    },
  });

  const products = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleCopyLink = (product: ProductData) => {
    const url = `https://nextpay.link/silva-design/${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    onShowToast(`Link de pagamento para "${product.title}" copiado com sucesso!`);
  };

  const categoryLabelMap: Record<string, string> = {
    servicos: 'Serviço Profissional',
    digitais: 'Produto Digital',
    recorrentes: 'Assinatura Recorrente',
    projetos: 'Projeto Sob Medida',
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
                {total} itens
              </span>
              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">database</span> Persistido
                em PostgreSQL
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between border border-surface-container/60 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Receita Recorrente
              </span>
              <span className="font-numeric-lg text-numeric-lg text-on-surface mt-space-xs font-bold">
                R$ 14.820,00
              </span>
              <span className="font-body-sm text-body-sm text-secondary flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">sync</span> Assinaturas
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
                Conversão Estimada
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
              <span className="font-numeric-lg text-numeric-lg text-primary mt-space-xs font-bold">
                100% Ativo
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs mt-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">shield_check</span>{' '}
                Antifraude Ativo
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">shopping_cart_checkout</span>
            </div>
          </div>
        </div>

        {/* Section Heading & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Catálogo de Produtos & Serviços
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Crie produtos para vender online com links de pagamento dinâmicos e split de
              comissões.
            </p>
          </div>
          <div className="flex items-center gap-space-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Cadastrar Novo Item</span>
            </button>
          </div>
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-surface-container/60">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Todos os Itens' },
              { id: 'servicos', label: 'Serviços' },
              { id: 'digitais', label: 'Digitais' },
              { id: 'recorrentes', label: 'Assinaturas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setSelectedFilter(f.id);
                  setPage(1);
                }}
                className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === f.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-surface-container-low pl-9 pr-space-md py-1.5 rounded-lg text-body-sm text-on-surface outline-none border border-surface-container focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-surface-container">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Exibição em Grade"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Exibição em Lista"
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty / Content */}
        {isLoading ? (
          <div className="py-16 text-center text-on-surface-variant flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
              progress_activity
            </span>
            <p className="font-body-md text-body-md">Carregando catálogo de produtos...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-error bg-error-container/20 rounded-xl p-4">
            <p className="font-semibold">Erro ao carregar catálogo:</p>
            <p className="text-sm">{(error as Error)?.message || 'Erro desconhecido'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant flex flex-col items-center gap-3 bg-surface-container-lowest rounded-xl border border-surface-container/60 p-8">
            <span className="material-symbols-outlined text-[48px] text-outline">inventory_2</span>
            <p className="font-body-lg font-semibold text-on-surface">Nenhum produto cadastrado</p>
            <p className="text-body-sm max-w-md text-on-surface-variant">
              {searchQuery
                ? 'Nenhum resultado encontrado para a busca.'
                : 'Cadastre produtos ou serviços para gerar links e receber pagamentos online.'}
            </p>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="mt-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-container"
            >
              Cadastrar Primeiro Item
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid / List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md'
                  : 'flex flex-col gap-space-sm'
              }
            >
              {products.map((product) => {
                const formattedPrice = (product.priceCents / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                });

                if (viewMode === 'list') {
                  return (
                    <div
                      key={product.id}
                      className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-surface-container/60 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-space-md min-w-0">
                        <img
                          src={
                            product.imageUrl ||
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M'
                          }
                          alt={product.title}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 bg-surface-container"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-title-md text-title-md font-semibold text-on-surface truncate">
                              {product.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-surface-container text-on-surface-variant shrink-0">
                              {categoryLabelMap[product.category] || product.category}
                            </span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant truncate max-w-xl">
                            {product.description || 'Sem descrição'}
                          </p>
                          <span className="font-numeric-md font-bold text-primary mt-1">
                            {formattedPrice}
                            {product.billingType === 'recorrente' ? '/mês' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(product)}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-body-sm text-on-surface flex items-center gap-1 font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            content_copy
                          </span>
                          <span>Copiar Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCheckoutWithProduct(product)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-body-sm flex items-center gap-1 font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            shopping_cart
                          </span>
                          <span>Checkout</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deseja excluir o produto "${product.title}"?`)) {
                              deleteMutation.mutate(product.id);
                            }
                          }}
                          className="p-1.5 hover:bg-error-container/20 text-error rounded-lg transition-colors"
                          title="Excluir Produto"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={product.id}
                    className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container/60 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 bg-surface-container overflow-hidden">
                      <img
                        src={
                          product.imageUrl ||
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M'
                        }
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-surface/90 text-on-surface shadow-xs backdrop-blur-xs">
                        {categoryLabelMap[product.category] || product.category}
                      </span>
                    </div>

                    <div className="p-space-md flex-1 flex flex-col justify-between gap-space-md">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-title-md text-title-md font-semibold text-on-surface line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {product.description || 'Sem descrição'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-space-sm pt-space-xs border-t border-surface-container/60">
                        <div className="flex items-baseline justify-between">
                          <span className="font-numeric-lg text-title-lg font-bold text-primary">
                            {formattedPrice}
                            {product.billingType === 'recorrente' ? (
                              <span className="text-xs text-outline font-normal">/mês</span>
                            ) : null}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-medium">
                            {product.billingType === 'recorrente'
                              ? 'Recorrência'
                              : 'À vista / Parcela'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(product)}
                            className="w-full py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface flex items-center justify-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              content_copy
                            </span>
                            <span>Link</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCheckoutWithProduct(product)}
                            className="w-full py-2 bg-primary hover:bg-primary-container rounded-lg text-xs font-semibold text-on-primary flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              shopping_cart
                            </span>
                            <span>Checkout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação Real */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-container text-body-sm text-on-surface-variant">
              <span>
                Mostrando {products.length} de {total} itens cadastrados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-on-surface"
                >
                  Anterior
                </button>
                <span className="text-xs font-semibold text-on-surface">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-surface-container-low hover:bg-surface-container rounded disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-on-surface"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drawer para cadastro */}
      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaveProduct={(data) => createMutation.mutate(data)}
        onShowToast={onShowToast}
        isSaving={createMutation.isPending}
      />
    </div>
  );
};
