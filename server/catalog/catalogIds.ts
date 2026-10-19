import { randomBytes } from 'node:crypto';

export function newProductPublicId(): string {
  return `np_prod_${randomBytes(10).toString('hex')}`;
}

export function newPaymentLinkPublicId(): string {
  return `np_link_${randomBytes(10).toString('hex')}`;
}

export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || `item-${Date.now()}`;
}

export function paymentLinkBaseUrl(): string {
  const configured = process.env.PAYMENT_LINK_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/+$/, '')}/pay`;
  }
  return 'https://nextpay.link/silva-design';
}

export function buildCheckoutUrl(slug: string): string {
  return `${paymentLinkBaseUrl()}/${slug}`;
}
