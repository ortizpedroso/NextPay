import type { NextFunction, Request, Response } from 'express';

import { verifyMerchantJwt } from '../../auth/jwt';

/**
 * Autenticação do painel do lojista: token administrativo legado ou JWT de sessão merchant.
 */
export function requireDashboardAuth(req: Request, res: Response, next: NextFunction): void {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  const header = req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const bearer = match?.[1]?.trim();

  if (bearer && adminToken && bearer === adminToken) {
    next();
    return;
  }

  if (bearer && jwtSecret) {
    const claims = verifyMerchantJwt(bearer, jwtSecret);
    if (claims) {
      (req as Request & { merchant?: typeof claims }).merchant = claims;
      next();
      return;
    }
  }

  res.status(401).json({
    error: 'Não autorizado.',
    code: 'UNAUTHORIZED',
  });
}
