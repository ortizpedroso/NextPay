import { Router } from 'express';
import { z } from 'zod';
import { getCurrentAccountId } from '../lib/auth.js';
import {
  listCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../repositories/customer.repository.js';

export const customersRouter = Router();

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ inválido'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
});

const updateCustomerSchema = createCustomerSchema.partial();

customersRouter.get('/customers', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string, 10) || 10));
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;

    const result = await listCustomers({
      accountId,
      page,
      pageSize,
      q,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

customersRouter.get('/customers/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const customer = await findCustomerById(req.params.id, accountId);
    if (!customer) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.post('/customers', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = createCustomerSchema.parse(req.body);

    const customer = await createCustomer({
      ...parsed,
      accountId,
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.put('/customers/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const parsed = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomer(req.params.id, accountId, parsed);
    if (!customer) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    res.json(customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.delete('/customers/:id', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const deleted = await deleteCustomer(req.params.id, accountId);
    if (!deleted) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }
    res.json({ ok: true, message: 'Cliente excluído com sucesso' });
  } catch (err) {
    next(err);
  }
});
