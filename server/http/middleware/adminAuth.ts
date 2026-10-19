import type { NextFunction, Request, Response } from 'express';

export function requireAdminApiToken(req: Request, res: Response, next: NextFunction): void {
  const configured = process.env.ADMIN_API_TOKEN?.trim();
  if (!configured) {
    res.status(503).json({
      error: 'Serviço administrativo indisponível.',
      code: 'ADMIN_NOT_CONFIGURED',
    });
    return;
  }

  const header = req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token || token !== configured) {
    res.status(401).json({
      error: 'Não autorizado.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  next();
}
