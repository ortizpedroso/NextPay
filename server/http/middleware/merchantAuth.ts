import type { NextFunction, Request, Response } from 'express';

export function requireMerchantApiKey(req: Request, res: Response, next: NextFunction): void {
  const configured = process.env.MERCHANT_API_KEY?.trim();
  if (!configured) {
    res.status(503).json({ error: 'API merchant indisponível.', code: 'MERCHANT_NOT_CONFIGURED' });
    return;
  }

  const provided = req.header('x-nextpay-merchant-key')?.trim();
  if (!provided || provided !== configured) {
    res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
    return;
  }

  next();
}
