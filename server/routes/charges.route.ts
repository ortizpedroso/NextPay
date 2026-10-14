import { Router } from 'express';
import { z } from 'zod';
import { getCurrentAccountId } from '../lib/auth.js';
import { listCharges, findChargeById, createCharge } from '../repositories/charge.repository.js';
import { PaymentMethod, ChargeStatus } from '@prisma/client';

export const chargesRouter = Router();

const createChargeSchema = z.object({
  customerId: z.string().optional().nullable(),
  paymentLinkId: z.string().optional().nullable(),
  description: z.string().min(2, 'Descrição deve ter ao menos 2 caracteres'),
  amountCents: z.number().int().positive('Valor deve ser positivo em centavos'),
  method: z.nativeEnum(PaymentMethod),
  dueDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

chargesRouter.get('/charges', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string, 10) || 10));
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const status =
      typeof req.query.status === 'string' &&
      Object.values(ChargeStatus).includes(req.query.status as ChargeStatus)
        ? (req.query.status as ChargeStatus)
        : undefined;
    const method =
      typeof req.query.method === 'string' &&
      Object.values(PaymentMethod).includes(req.query.method as PaymentMethod)
        ? (req.query.method as PaymentMethod)
        : undefined;

    const result = await listCharges({
      accountId,
      page,
      pageSize,
      q,
      status,
      method,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

chargesRouter.get('/charges/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const charge = await findChargeById(req.params.id, accountId);
    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json(charge);
  } catch (err) {
    next(err);
  }
});

chargesRouter.post('/charges', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = createChargeSchema.parse(req.body);

    const charge = await createCharge({
      accountId,
      customerId: parsed.customerId || null,
      paymentLinkId: parsed.paymentLinkId || null,
      description: parsed.description,
      amountCents: parsed.amountCents,
      method: parsed.method,
      dueDate: new Date(parsed.dueDate),
      status: ChargeStatus.PENDING,
    });

    res.status(201).json(charge);
  } catch (err) {
    next(err);
  }
});
