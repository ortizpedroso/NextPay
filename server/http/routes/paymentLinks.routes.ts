import { Router } from 'express';
import { z } from 'zod';

import {
  buildCheckoutUrl,
  newPaymentLinkPublicId,
  slugifyTitle,
} from '../../catalog/catalogIds';

const billingTypeSchema = z.enum(['avulsa', 'recorrente']);
const linkStatusSchema = z.enum(['ACTIVE', 'PAUSED']);

export type PaymentLinkRecord = {
  linkPublicId: string;
  urlSlug: string;
  title: string;
  subtitle: string;
  billingType: z.infer<typeof billingTypeSchema>;
  status: z.infer<typeof linkStatusSchema>;
  amountCents: number;
  totalBilledCents: number;
  salesCount: number;
  viewCount: number;
  expiresAt: string | null;
  productPublicId: string | null;
  checkoutUrl: string;
};

export interface PaymentLinkStore {
  list(): Promise<PaymentLinkRecord[]>;
  getByPublicId(linkPublicId: string): Promise<PaymentLinkRecord | null>;
  create(input: {
    linkPublicId: string;
    urlSlug: string;
    title: string;
    subtitle: string;
    billingType: z.infer<typeof billingTypeSchema>;
    amountCents: number;
    expiresAt?: Date | null;
    productPublicId?: string | null;
  }): Promise<PaymentLinkRecord>;
  update(
    linkPublicId: string,
    patch: Partial<
      Pick<
        PaymentLinkRecord,
        'title' | 'subtitle' | 'billingType' | 'status' | 'amountCents' | 'expiresAt' | 'urlSlug'
      >
    >,
  ): Promise<PaymentLinkRecord | null>;
  incrementView(linkPublicId: string): Promise<void>;
}

export class InMemoryPaymentLinkStore implements PaymentLinkStore {
  private readonly rows = new Map<string, PaymentLinkRecord>();

  async list(): Promise<PaymentLinkRecord[]> {
    return [...this.rows.values()];
  }

  async getByPublicId(linkPublicId: string): Promise<PaymentLinkRecord | null> {
    return this.rows.get(linkPublicId) ?? null;
  }

  async create(input: {
    linkPublicId: string;
    urlSlug: string;
    title: string;
    subtitle: string;
    billingType: z.infer<typeof billingTypeSchema>;
    amountCents: number;
    expiresAt?: Date | null;
    productPublicId?: string | null;
  }): Promise<PaymentLinkRecord> {
    const record: PaymentLinkRecord = {
      linkPublicId: input.linkPublicId,
      urlSlug: input.urlSlug,
      title: input.title,
      subtitle: input.subtitle,
      billingType: input.billingType,
      status: 'ACTIVE',
      amountCents: input.amountCents,
      totalBilledCents: 0,
      salesCount: 0,
      viewCount: 0,
      expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
      productPublicId: input.productPublicId ?? null,
      checkoutUrl: buildCheckoutUrl(input.urlSlug),
    };
    this.rows.set(record.linkPublicId, record);
    return record;
  }

  async update(
    linkPublicId: string,
    patch: Partial<
      Pick<
        PaymentLinkRecord,
        'title' | 'subtitle' | 'billingType' | 'status' | 'amountCents' | 'expiresAt' | 'urlSlug'
      >
    >,
  ): Promise<PaymentLinkRecord | null> {
    const existing = this.rows.get(linkPublicId);
    if (!existing) {
      return null;
    }
    const urlSlug = patch.urlSlug ?? existing.urlSlug;
    const updated: PaymentLinkRecord = {
      ...existing,
      ...patch,
      urlSlug,
      checkoutUrl: buildCheckoutUrl(urlSlug),
    };
    this.rows.set(linkPublicId, updated);
    return updated;
  }

  async incrementView(linkPublicId: string): Promise<void> {
    const row = this.rows.get(linkPublicId);
    if (row) {
      row.viewCount += 1;
    }
  }
}

const createLinkSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional(),
  billingType: billingTypeSchema.default('avulsa'),
  amountCents: z.number().int().positive(),
  expiresAt: z.string().datetime().optional(),
  productPublicId: z.string().max(80).optional(),
  urlSlug: z.string().min(2).max(120).optional(),
});

const updateLinkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(500).optional(),
  billingType: billingTypeSchema.optional(),
  status: linkStatusSchema.optional(),
  amountCents: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export function createPaymentLinksRouter(linkStore: PaymentLinkStore): Router {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const paymentLinks = await linkStore.list();
      res.json({ paymentLinks });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:linkPublicId', async (req, res, next) => {
    try {
      const paymentLink = await linkStore.getByPublicId(req.params.linkPublicId);
      if (!paymentLink) {
        res.status(404).json({ error: 'Link não encontrado.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ paymentLink });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = createLinkSchema.parse(req.body);
      const linkPublicId = newPaymentLinkPublicId();
      let urlSlug = body.urlSlug ?? slugifyTitle(body.title);
      urlSlug = `${urlSlug}-${linkPublicId.slice(-6)}`;

      const subtitle =
        body.subtitle?.trim() ||
        (body.billingType === 'recorrente'
          ? 'Assinatura recorrente via Pix e Cartão'
          : 'Pagamento único via Pix e Cartão');

      const paymentLink = await linkStore.create({
        linkPublicId,
        urlSlug,
        title: body.title.trim(),
        subtitle,
        billingType: body.billingType,
        amountCents: body.amountCents,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        productPublicId: body.productPublicId ?? null,
      });

      res.status(201).json({ paymentLink });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:linkPublicId', async (req, res, next) => {
    try {
      const body = updateLinkSchema.parse(req.body);
      const patch: Parameters<PaymentLinkStore['update']>[1] = {
        ...body,
        expiresAt:
          body.expiresAt === undefined
            ? undefined
            : body.expiresAt === null
              ? null
              : body.expiresAt,
      };
      const paymentLink = await linkStore.update(req.params.linkPublicId, patch);
      if (!paymentLink) {
        res.status(404).json({ error: 'Link não encontrado.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ paymentLink });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
