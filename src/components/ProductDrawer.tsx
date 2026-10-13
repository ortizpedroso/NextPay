import React, { useState } from 'react';
import { ProductItem } from '../data/mockData';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (newProduct: ProductItem) => void;
  onShowToast: (msg: string) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'servicos' | 'digitais' | 'recorrentes' | 'projetos'>(
    'servicos',
  );
  const [billingType, setBillingType] = useState<'avulsa' | 'recorrente'>('avulsa');
  const [price, setPrice] = useState('450,00');
  const [installments, setInstallments] = useState('12x');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const categoryLabelMap = {
    servicos: 'Serviço Profissional',
    digitais: 'Produto Digital',
    recorrentes: 'Assinatura Recorrente',
    projetos: 'Projeto Sob Medida',
  };

  const getCleanPrice = () => {
    const cleanStr = price.replace(/\./g, '').replace(',', '.').trim();
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Informe o título do item.');
      return;
    }

    const numericPrice = getCleanPrice();
    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() || 'Descrição dos entregáveis e benefícios inclusos no pacote.',
      category,
      categoryLabel: categoryLabelMap[category],
      price: numericPrice,
      priceFormatted: `R$ ${price || '0,00'}${billingType === 'recorrente' ? '/mês' : ''}`,
      billingType,
      installmentsText:
        billingType === 'recorrente' ? 'Débito recorrente mensal' : `Até ${installments} no cartão`,
      imageUrl:
        imageUrl.trim() ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOzWFlzQ-IwFq8v30Kx900QdiI2m6XjwECu_4wBONT6FbAStbJoGGNtNkwI8sab4pvYy4nS57KOIea5foq50ZI7EItbVhbrLP3nmZnhB-ES_c3yX2-DmRasBMcjm-YbnFKXUSxnh9_pmM2OnpClggsxKubahzxo9t-rDeHh_e5vEQ63qixUpkFHYrtetBY18wVCxMkm3k_GT0RFaTz1w3gcUN_hnr0tFtUveDpxiiKPQbJeAnB0M',
      salesCount: 0,
      statsText: 'Novo item • 0 vendas',
    };

    onSaveProduct(newProduct);
    onShowToast(`Item "${newProduct.title}" cadastrado e link de checkout ativo!`);
    onClose();
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
            className="h-8 w-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            title="Fechar gaveta"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-lg">
          {/* Live Preview Container (Simulating Client Checkout) */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
              Pré-visualização do Link de Pagamento (Visão do Cliente)
            </span>
            <div className="bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col sm:flex-row gap-space-md border border-surface-container/60">
                <div className="w-full sm:w-28 h-28 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[32px] text-outline">
                      image
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm uppercase font-semibold">
                      {categoryLabelMap[category]}
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface mt-1 font-semibold truncate">
                      {title || 'Título do Produto ou Serviço'}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                      {description ||
                        'Descrição breve de como este item agrega valor ao seu cliente...'}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between mt-space-sm pt-space-xs border-t border-surface-container/60">
                    <div>
                      <span className="font-label-sm text-label-sm text-outline block">
                        {billingType === 'recorrente' ? 'Mensalidade Recorrente' : 'Total a Pagar'}
                      </span>
                      <span className="font-numeric-lg text-headline-sm text-on-surface font-bold">
                        R$ {price || '0,00'}
                        {billingType === 'recorrente' && (
                          <span className="text-xs font-normal">/mês</span>
                        )}
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-medium">
                      {billingType === 'recorrente'
                        ? 'Débito recorrente'
                        : `Até ${installments} no cartão`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form id="item-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
            {/* Field: Title */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-md text-label-md text-on-surface font-semibold"
                htmlFor="input-title"
              >
                Título do Item <span className="text-error">*</span>
              </label>
              <input
                id="input-title"
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sessão Estratégica de Marketing"
                className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
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
                  Tipo de Cobrança
                </label>
                <div className="grid grid-cols-2 gap-1 bg-surface-container-low p-1 rounded-lg border border-surface-container">
                  <button
                    type="button"
                    onClick={() => setBillingType('avulsa')}
                    className={`px-2 py-1.5 rounded-md font-label-md text-label-md transition-all font-semibold ${
                      billingType === 'avulsa'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Única (Avulsa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingType('recorrente')}
                    className={`px-2 py-1.5 rounded-md font-label-md text-label-md transition-all font-semibold ${
                      billingType === 'recorrente'
                        ? 'bg-surface-container-lowest text-tertiary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Recorrente
                  </button>
                </div>
              </div>
            </div>

            {/* Field: Base Price and Max Installments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label
                  className="font-label-md text-label-md text-on-surface font-semibold"
                  htmlFor="input-price"
                >
                  Preço Base (R$) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-numeric-md text-outline">R$</span>
                  <input
                    id="input-price"
                    required
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="450,00"
                    className="w-full pl-9 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-numeric-md text-numeric-md placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-medium">
                  Líquido Pix: ~99,01% imediato (D+0)
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Parcelamento Máximo
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="1x">Somente à vista (1x)</option>
                  <option value="3x">Até 3x sem juros</option>
                  <option value="6x">Até 6x com repasse</option>
                  <option value="12x">Até 12x no cartão</option>
                </select>
              </div>
            </div>

            {/* Field: Description */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-md text-label-md text-on-surface font-semibold"
                htmlFor="input-desc"
              >
                Descrição do Produto ou Serviço
              </label>
              <textarea
                id="input-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique os entregáveis, formato de execução ou bônus inclusos..."
                className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline border border-surface-container focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Field: Cover Image Upload URL / Presets */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Imagem de Capa do Item
              </label>
              <div
                onClick={() => {
                  setImageUrl(
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBuyIQJXrgS104egwX6vtcxZk5Vl6cQU-I-F3VG8ln5qWr04iARdxvK0P-vJREauVxHmYHkjn1yn_wY2nmYoRs-reBccbmC4GjcS9ALVQxXBODFsJA6dQxnGk2JX2ss2Gdnk6e-0_QZspaf-QkY1FOQUk-sF9N9TKPAYtdJyvCZi8Tq-bxXR_rx2uMZ3nJ262wCYDOT_xLaO9eVAIsv7IyMKoVLWfJcHR79Udhk-nW8duK1BEigKFg',
                  );
                }}
                className="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-high transition-colors border border-dashed border-outline-variant"
              >
                <span className="material-symbols-outlined text-[28px] text-primary mb-1">
                  cloud_upload
                </span>
                <span className="font-label-md text-label-md text-on-surface font-medium">
                  Clique para selecionar imagem ou usar exemplo de alta definição
                </span>
                <span className="font-body-sm text-body-sm text-outline mt-0.5">
                  JPG, PNG ou WEBP até 5MB
                </span>
              </div>
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
            type="button"
            disabled
            title="Em breve (Fase 4)"
            className="flex items-center gap-space-xs bg-surface-container-high text-on-surface-variant/70 cursor-not-allowed px-space-lg py-2.5 rounded-lg font-label-md text-label-md font-semibold opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Salvar e Gerar Link</span>
            <span className="ml-1 text-[10px] font-bold uppercase bg-surface-container-highest px-1.5 py-0.5 rounded text-outline">
              Em breve
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
};
