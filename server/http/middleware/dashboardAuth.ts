import type { NextFunction, Response } from 'express';

import { verifyMerchantJwt } from '../../auth/jwt';
import type { DashboardRequest } from '../../merchant/merchantScope';

/**
 * Autenticação do painel do lojista: token administrativo legado ou JWT de sessão merchant.
 */
export function requireDashboardAuth(req: DashboardRequest, res: Response, next: NextFunction): void {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  const jwtSecret = process.env.JWT_SECRET?.trim();

  const header = req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const bearer = match?.[1]?.trim();

  if (bearer && adminToken && bearer === adminToken) {
    req.dashboardIsAdmin = true;
    next();
    return;
  }

  if (bearer && jwtSecret) {
    const claims = verifyMerchantJwt(bearer, jwtSecret);
    if (claims) {
      req.merchant = claims;
      next();
      return;
    }
  }

  res.status(401).json({
    error: 'Não autorizado.',
    code: 'UNAUTHORIZED',
  });
}
