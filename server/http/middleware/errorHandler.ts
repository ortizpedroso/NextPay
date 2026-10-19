import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return;
  }

  const message = err instanceof Error ? err.message : 'Erro interno do servidor.';
  const status = message.includes('não configurada') ? 404 : 500;

  res.status(status).json({
    error: message,
    code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
  });
}
