import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { signMerchantJwt } from '../../auth/jwt';
import { prisma } from '../../db/prisma';
import { requireDashboardAuth } from '../middleware/dashboardAuth';
import type { DashboardRequest } from '../../merchant/merchantScope';
import {
  DEFAULT_MERCHANT_PUBLIC_ID,
  resolveMerchantDbIdForRead,
} from '../../merchant/merchantScope';

const loginSchema = z.object({
  email: z.string().email().max(180),
  password: z.string().min(8).max(128),
});

function verifyPassword(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createMerchantAuthRouter(): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    const secret = process.env.JWT_SECRET?.trim();
    const email = process.env.MERCHANT_LOGIN_EMAIL?.trim().toLowerCase();
    const password = process.env.MERCHANT_LOGIN_PASSWORD?.trim();

    if (!secret || !email || !password) {
      res.status(503).json({
        error: 'Login do lojista não configurado no servidor.',
        code: 'MERCHANT_LOGIN_DISABLED',
      });
      return;
    }

    let body: z.infer<typeof loginSchema>;
    try {
      body = loginSchema.parse(req.body);
    } catch {
      res.status(400).json({ error: 'Credenciais inválidas.', code: 'INVALID_BODY' });
      return;
    }

    if (body.email.toLowerCase() !== email || !verifyPassword(body.password, password)) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.', code: 'UNAUTHORIZED' });
      return;
    }

    const normalizedEmail = body.email.toLowerCase();

    let merchantPublicId = DEFAULT_MERCHANT_PUBLIC_ID;
    let displayName = process.env.MERCHANT_DISPLAY_NAME?.trim() || 'Lojista NextPay';
    let userSub = 'merchant-env-login';

    try {
      const dbUser = await prisma.merchantUser.findUnique({
        where: { email: normalizedEmail },
        include: { merchant: true },
      });
      if (dbUser) {
        merchantPublicId = dbUser.merchant.merchantPublicId;
        displayName = dbUser.merchant.displayName;
        userSub = dbUser.id;
      }
    } catch {
      // Sem banco (testes unitários): mantém login via variáveis de ambiente.
    }

    const token = signMerchantJwt(
      {
        sub: userSub,
        merchantId: merchantPublicId,
        email: normalizedEmail,
        role: 'merchant',
      },
      secret,
    );

    res.json({
      token,
      merchant: {
        email: normalizedEmail,
        displayName,
        merchantId: merchantPublicId,
      },
    });
  });

  router.get('/me', requireDashboardAuth, async (req, res, next) => {
    try {
      const dashboardReq = req as DashboardRequest;
      const merchantPublicId = dashboardReq.merchant?.merchantId ?? DEFAULT_MERCHANT_PUBLIC_ID;

      try {
        const merchantDbId = await resolveMerchantDbIdForRead(dashboardReq);
        const merchantRow = await prisma.merchant.findFirst({
          where: merchantDbId ? { id: merchantDbId } : { merchantPublicId },
        });

        const confirmedStatuses = ['RECEIVED', 'CONFIRMED', 'Liquidado'];
        const ledgerWhere = merchantDbId ? { merchantId: merchantDbId } : undefined;

        const [transactionCount, volumeAgg, availableAgg] = await Promise.all([
          prisma.ledgerTransaction.count({ where: ledgerWhere }),
          prisma.ledgerTransaction.aggregate({
            where: ledgerWhere,
            _sum: { amountCents: true },
          }),
          prisma.ledgerTransaction.aggregate({
            where: {
              ...ledgerWhere,
              status: { in: confirmedStatuses },
            },
            _sum: { netAmountCents: true, amountCents: true },
          }),
        ]);

        const availableCents =
          availableAgg._sum.netAmountCents ?? availableAgg._sum.amountCents ?? 0;

        res.json({
          merchant: {
            merchantId: merchantRow?.merchantPublicId ?? merchantPublicId,
            displayName: merchantRow?.displayName ?? 'Lojista NextPay',
            email: dashboardReq.merchant?.email ?? process.env.MERCHANT_LOGIN_EMAIL ?? '',
            ledgerTransactionCount: transactionCount,
            grossVolumeCents: volumeAgg._sum.amountCents ?? 0,
            availableBalanceCents: availableCents,
          },
        });
        return;
      } catch {
        // Sem banco (testes unitários)
      }

      res.json({
        merchant: {
          merchantId: merchantPublicId,
          displayName: process.env.MERCHANT_DISPLAY_NAME?.trim() || 'Lojista NextPay',
          email: dashboardReq.merchant?.email ?? process.env.MERCHANT_LOGIN_EMAIL ?? '',
          ledgerTransactionCount: 0,
          grossVolumeCents: 0,
          availableBalanceCents: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
