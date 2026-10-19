import type { NextFunction, Response } from 'express';

import { prisma } from '../../db/prisma';
import { verifyMerchantApiKeySecret } from '../../merchant/merchantApiKeys';
import type { MerchantApiRequest } from '../../merchant/merchantScope';

function merchantApiConfigured(): boolean {
  if (process.env.MERCHANT_API_KEY?.trim()) {
    return true;
  }
  if (process.env.DATABASE_URL?.trim()) {
    return true;
  }
  return false;
}

export function requireMerchantApiKey(
  req: MerchantApiRequest,
  res: Response,
  next: NextFunction,
): void {
  void (async () => {
    if (!merchantApiConfigured()) {
      res
        .status(503)
        .json({ error: 'API merchant indisponível.', code: 'MERCHANT_NOT_CONFIGURED' });
      return;
    }

    const provided = req.header('x-nextpay-merchant-key')?.trim();
    if (!provided) {
      res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
      return;
    }

    const legacyKey = process.env.MERCHANT_API_KEY?.trim();
    if (legacyKey && provided === legacyKey) {
      next();
      return;
    }

    try {
      const verified = await verifyMerchantApiKeySecret(prisma, provided);
      if (verified) {
        req.merchantApiKeyAuth = verified;
        next();
        return;
      }
    } catch {
      if (legacyKey) {
        res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
        return;
      }
      res
        .status(503)
        .json({ error: 'API merchant indisponível.', code: 'MERCHANT_NOT_CONFIGURED' });
      return;
    }

    res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
  })().catch(next);
}
