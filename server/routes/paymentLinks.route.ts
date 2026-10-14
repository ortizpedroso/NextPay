import { Router } from 'express';
import { z } from 'zod';
import { getCurrentAccountId } from '../lib/auth.js';
import {
  listPaymentLinks,
  findPaymentLinkById,
  createPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
} from '../repositories/paymentLink.repository.js';
import { BillingType } from '@prisma/client';

export const paymentLinksRouter = Router();

const createPaymentLinkSchema = z.object({
  productId: z.string().optional().nullable(),
  title: z.string().min(2, 'Título deve ter ao menos 2 caracteres'),
  description: z.string().optional().nullable(),
  amountCents: z.number().int().positive('Valor deve ser positivo em centavos'),
  billingType: z.nativeEnum(BillingType).default(BillingType.avulsa),
  slug: z.string().optional(),
  active: z.boolean().default(true),
  maxInstallments: z.number().int().min(1).max(21).default(12),
  enablePix: z.boolean().default(true),
  enableCard: z.boolean().default(true),
  enableBoleto: z.boolean().default(true),
});

const updatePaymentLinkSchema = createPaymentLinkSchema.partial();

paymentLinksRouter.get('/payment-links', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string, 10) || 10));
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const type =
      req.query.type === 'recorrente'
        ? BillingType.recorrente
        : req.query.type === 'avulsa'
          ? BillingType.avulsa
          : undefined;
    const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

    const result = await listPaymentLinks({
      accountId,
      page,
      pageSize,
      q,
      type,
      active,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

paymentLinksRouter.get('/payment-links/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const link = await findPaymentLinkById(req.params.id, accountId);
    if (!link) {
      res.status(404).json({ error: 'Link de pagamento não encontrado' });
      return;
    }
    res.json(link);
  } catch (err) {
    next(err);
  }
});

paymentLinksRouter.post('/payment-links', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = createPaymentLinkSchema.parse(req.body);

    const link = await createPaymentLink({
      ...parsed,
      accountId,
    });

    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

paymentLinksRouter.put('/payment-links/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = updatePaymentLinkSchema.parse(req.body);

    const link = await updatePaymentLink(req.params.id, accountId, parsed);
    if (!link) {
      res.status(404).json({ error: 'Link de pagamento não encontrado' });
      return;
    }

    res.json(link);
  } catch (err) {
    next(err);
  }
});

paymentLinksRouter.patch('/payment-links/:id/toggle', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const existing = await findPaymentLinkById(req.params.id, accountId);
    if (!existing) {
      res.status(404).json({ error: 'Link de pagamento não encontrado' });
      return;
    }

    const updated = await updatePaymentLink(req.params.id, accountId, {
      active: !existing.active,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

paymentLinksRouter.delete('/payment-links/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const deleted = await deletePaymentLink(req.params.id, accountId);
    if (!deleted) {
      res.status(404).json({ error: 'Link de pagamento não encontrado' });
      return;
    }
    res.json({ ok: true, message: 'Link excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});
