import React, { useState } from 'react';
import { ProductData } from '../api/client';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (newProduct: Partial<ProductData>) => void;
  onShowToast: (msg: string) => void;
  isSaving?: boolean;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  onShowToast,
  isSaving = false,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'servicos' | 'digitais' | 'recorrentes' | 'projetos'>(
    'servicos',
  );
  const [billingType, setBillingType] = useState<'avulsa' | 'recorrente'>('avulsa');
  const [price, setPrice] = useState('450,00');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const getCleanPriceInCents = () => {
    const cleanStr = price.replace(/\./g, '').replace(',', '.').trim();
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Informe o título do produto.');
      return;
    }

    const priceCents = getCleanPriceInCents();
    if (priceCents <= 0) {
      onShowToast('Informe um valor válido maior que zero.');
      return;
    }

    onSaveProduct({
      title: title.trim(),
      description: description.trim() || null,
      category,
      priceCents,
      billingType,
      imageUrl: imageUrl.trim() || null,
      active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        {/* Drawer Header */}
        <div className="h-16 px-space-lg flex items-center justify-between bg-surface-container-low border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">add_business</span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-title-md text-title-md text-on-surface font-semibold leading-tight">
                Cadastrar Novo Item
              </h2>
              <span className="font-label-sm text-label-sm text-outline">
                Disponibilize para venda imediata via Pix ou Cartão
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-space-lg">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
            {/* Field: Title */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Título do Item / Serviço *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Consultoria Estratégica em Design UX/UI"
                className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
              />
            </div>

            {/* Field: Category & Billing Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as 'servicos' | 'digitais' | 'recorrentes' | 'projetos',
                    )
                  }
                  className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="servicos">Serviço Profissional</option>
                  <option value="digitais">Produto Digital / Download</option>
                  <option value="recorrentes">Assinatura / Plano Recorrente</option>
                  <option value="projetos">Projeto Sob Medida</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Modelo de Cobrança
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingType('avulsa')}
                    className={`py-2 px-3 rounded-lg border font-label-md text-label-md font-medium transition-all text-center ${
                      billingType === 'avulsa'
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    Avulsa
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('recorrente')}
                    className={`py-2 px-3 rounded-lg border font-label-md text-label-md font-medium transition-all text-center ${
                      billingType === 'recorrente'
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    Recorrente
                  </button>
                </div>
              </div>
            </div>

            {/* Field: Price */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Valor Base de Venda (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-on-surface-variant font-bold text-body-md">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-surface-container-low pl-10 pr-space-md py-2.5 rounded-lg border border-surface-container text-body-md font-numeric-md font-bold focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface"
                />
              </div>
            </div>

            {/* Field: Description */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Descrição dos Entregáveis
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhe o que está incluso no pacote para exibição na página de pagamento..."
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all resize-none placeholder:text-outline"
              />
            </div>

            {/* Field: Image URL */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                URL da Capa ou Foto do Item
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
              />
            </div>
          </form>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-space-sm">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSaving}
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>{isSaving ? 'Salvando...' : 'Salvar Produto'}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
