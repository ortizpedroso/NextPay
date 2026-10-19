import { Router } from 'express';
import { z } from 'zod';

import type { CatalogProductStore } from './products.routes';
import type { PaymentLinkStore } from './paymentLinks.routes';

function publicLinkPayload(link: Awaited<ReturnType<PaymentLinkStore['getByPublicId']>>) {
  if (!link) {
    return null;
  }
  return {
    kind: 'payment_link' as const,
    linkPublicId: link.linkPublicId,
    title: link.title,
    subtitle: link.subtitle,
    billingType: link.billingType,
    amountCents: link.amountCents,
    status: link.status,
    checkoutUrl: link.checkoutUrl,
  };
}

function publicProductPayload(product: Awaited<ReturnType<CatalogProductStore['getByPublicId']>>) {
  if (!product || product.status !== 'ACTIVE') {
    return null;
  }
  return {
    kind: 'product' as const,
    productPublicId: product.productPublicId,
    title: product.title,
    description: product.description,
    priceCents: product.priceCents,
    billingType: product.billingType,
    maxInstallments: product.maxInstallments,
    imageUrl: product.imageUrl,
    checkoutUrl: product.checkoutUrl,
  };
}

export function createPublicPaymentLinksRouter(
  paymentLinkStore: PaymentLinkStore,
  catalogProductStore: CatalogProductStore,
): Router {
  const router = Router();

  router.get('/payment-links/:slugOrId', async (req, res, next) => {
    try {
      const slugOrId = z.string().min(2).max(120).parse(req.params.slugOrId);
      const link = await paymentLinkStore.getBySlugOrPublicId(slugOrId);
      if (!link || link.status !== 'ACTIVE') {
        res.status(404).json({ error: 'Link não encontrado.', code: 'NOT_FOUND' });
        return;
      }

      await paymentLinkStore.incrementView(link.linkPublicId);

      res.json({
        checkout: publicLinkPayload(link),
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/products/:slugOrId', async (req, res, next) => {
    try {
      const slugOrId = z.string().min(2).max(120).parse(req.params.slugOrId);
      const product = await catalogProductStore.getBySlugOrPublicId(slugOrId);
      const payload = publicProductPayload(product);
      if (!payload) {
        res.status(404).json({ error: 'Produto não encontrado.', code: 'NOT_FOUND' });
        return;
      }

      res.json({ checkout: payload });
    } catch (error) {
      next(error);
    }
  });

  router.get('/resolve/:slugOrId', async (req, res, next) => {
    try {
      const slugOrId = z.string().min(2).max(120).parse(req.params.slugOrId);
      const link = await paymentLinkStore.getBySlugOrPublicId(slugOrId);
      if (link && link.status === 'ACTIVE') {
        await paymentLinkStore.incrementView(link.linkPublicId);
        res.json({ checkout: publicLinkPayload(link) });
        return;
      }

      const product = await catalogProductStore.getBySlugOrPublicId(slugOrId);
      const productPayload = publicProductPayload(product);
      if (productPayload) {
        res.json({ checkout: productPayload });
        return;
      }

      res.status(404).json({ error: 'Checkout não encontrado.', code: 'NOT_FOUND' });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
