import { Router } from 'express';
import { z } from 'zod';
import { getCurrentAccountId } from '../lib/auth.js';
import {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../repositories/product.repository.js';
import { BillingType } from '@prisma/client';

export const productsRouter = Router();

const createProductSchema = z.object({
  title: z.string().min(2, 'Título deve ter ao menos 2 caracteres'),
  description: z.string().optional().nullable(),
  category: z.string().default('servicos'),
  priceCents: z.number().int().positive('Valor deve ser positivo em centavos'),
  billingType: z.nativeEnum(BillingType).default(BillingType.avulsa),
  cycle: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  active: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

productsRouter.get('/products', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string, 10) || 10));
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;

    const result = await listProducts({
      accountId,
      page,
      pageSize,
      q,
      category,
      active,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

productsRouter.get('/products/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const product = await findProductById(req.params.id, accountId);
    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.post('/products', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = createProductSchema.parse(req.body);

    const product = await createProduct({
      ...parsed,
      accountId,
      imageUrl: parsed.imageUrl || null,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.put('/products/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = updateProductSchema.parse(req.body);

    const product = await updateProduct(req.params.id, accountId, {
      ...parsed,
      imageUrl: parsed.imageUrl === '' ? null : parsed.imageUrl,
    });

    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

productsRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const deleted = await deleteProduct(req.params.id, accountId);
    if (!deleted) {
      res.status(404).json({ error: 'Produto não encontrado' });
      return;
    }
    res.json({ ok: true, message: 'Produto excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});
