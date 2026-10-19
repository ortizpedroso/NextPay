import type { PaymentLink, ProductItem } from '../../data/mockData';
import { formatBRL } from '../format';

import type { CatalogProductDto, PaymentLinkDto } from './adminOperations';

const categoryLabelMap: Record<ProductItem['category'], string> = {
  servicos: 'Serviço Profissional',
  digitais: 'Produto Digital',
  recorrentes: 'Assinatura Recorrente',
  projetos: 'Projeto Sob Medida',
};

function installmentsText(billingType: ProductItem['billingType'], maxInstallments: number): string {
  if (billingType === 'recorrente') {
    return 'Débito recorrente mensal';
  }
  if (maxInstallments <= 1) {
    return 'Somente à vista (1x)';
  }
  return `Até ${maxInstallments}x no cartão`;
}

function linkTypeLabel(billingType: PaymentLink['type']): string {
  return billingType === 'recorrente' ? 'Recorrente Mensal' : 'Cobrança Avulsa';
}

function conversionRate(views: number, sales: number): string {
  if (views <= 0) {
    return '0.0%';
  }
  return `${((sales / views) * 100).toFixed(1)}%`;
}

export function catalogProductToItem(dto: CatalogProductDto): ProductItem {
  const billingType = dto.billingType;
  const priceSuffix = billingType === 'recorrente' ? '/mês' : '';
  return {
    id: dto.productPublicId,
    checkoutUrl: dto.checkoutUrl,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    categoryLabel: categoryLabelMap[dto.category] ?? dto.category,
    badge: dto.badge ?? undefined,
    price: dto.priceCents / 100,
    priceFormatted: `${formatBRL(dto.priceCents)}${priceSuffix}`,
    billingType,
    recurrencyCycle: dto.recurrencyCycle ?? undefined,
    installmentsText: installmentsText(billingType, dto.maxInstallments),
    imageUrl: dto.imageUrl,
    salesCount: dto.salesCount,
    statsText:
      dto.salesCount > 0
        ? `${dto.salesCount} cobranças liquidadas`
        : 'Novo item • 0 vendas',
  };
}

export function paymentLinkDtoToItem(dto: PaymentLinkDto): PaymentLink {
  const billingType = dto.billingType;
  const priceSuffix = billingType === 'recorrente' ? '/mês' : '';
  const views = Math.max(dto.viewCount, dto.salesCount);
  return {
    id: dto.linkPublicId,
    title: dto.title,
    subtitle: dto.subtitle,
    type: billingType,
    typeLabel: linkTypeLabel(billingType),
    status: dto.status === 'PAUSED' ? 'Pausado' : 'Ativo',
    unitPrice: dto.amountCents / 100,
    unitPriceFormatted: `${formatBRL(dto.amountCents)}${priceSuffix}`,
    totalBilledFormatted: formatBRL(dto.totalBilledCents),
    sales: dto.salesCount,
    views,
    conversionRate: conversionRate(views, dto.salesCount),
    url: dto.checkoutUrl,
  };
}
