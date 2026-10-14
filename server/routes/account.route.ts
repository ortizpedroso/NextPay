import { Router } from 'express';
import { getCurrentAccountId } from '../lib/auth.js';
import { findAccountById } from '../repositories/account.repository.js';

export const accountRouter = Router();

accountRouter.get('/account', async (_req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const account = await findAccountById(accountId);

    if (!account) {
      res.status(404).json({ error: 'Conta não encontrada' });
      return;
    }

    res.json({
      id: account.id,
      name: account.name,
      email: account.email,
      cpfCnpj: account.cpfCnpj,
      phone: account.phone,
      bankName: account.bankName,
      bankCode: account.bankCode,
      agency: account.agency,
      account: account.account,
      accountType: account.accountType,
      pixKey: account.pixKey,
      balanceCents: account.balanceCents,
      balanceFormatted: (account.balanceCents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    });
  } catch (err) {
    next(err);
  }
});
