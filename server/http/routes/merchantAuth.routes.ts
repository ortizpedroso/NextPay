import { Router } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { signMerchantJwt } from '../../auth/jwt';

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

  router.post('/login', (req, res) => {
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

    if (
      body.email.toLowerCase() !== email ||
      !verifyPassword(body.password, password)
    ) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.', code: 'UNAUTHORIZED' });
      return;
    }

    const token = signMerchantJwt(
      { sub: 'merchant-default', email: body.email.toLowerCase(), role: 'merchant' },
      secret,
    );

    res.json({
      token,
      merchant: {
        email: body.email.toLowerCase(),
        displayName: process.env.MERCHANT_DISPLAY_NAME?.trim() || 'Lojista NextPay',
      },
    });
  });

  return router;
}
