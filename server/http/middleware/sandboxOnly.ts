import type { NextFunction, Request, Response } from 'express';

import { resolveDefaultGatewayEnvironment } from '../../config/gatewayEnvironment';

/** Bloqueia rotas de simulação quando o gateway padrão é PRODUCTION. */
export function requireSandboxEnvironment(_req: Request, res: Response, next: NextFunction): void {
  const env = resolveDefaultGatewayEnvironment();
  if (env === 'PRODUCTION' && process.env.NODE_ENV === 'production') {
    res.status(403).json({
      error: 'Simulação disponível apenas em sandbox.',
      code: 'SANDBOX_ONLY',
    });
    return;
  }
  next();
}
