import type { NextFunction, Request, Response } from 'express';

/**
 * Rotinas internas (cron/jobs): aceita ADMIN_API_TOKEN ou INTERNAL_JOB_TOKEN no Bearer.
 */
export function requireInternalOrAdminToken(req: Request, res: Response, next: NextFunction): void {
  const adminToken = process.env.ADMIN_API_TOKEN?.trim();
  const internalToken = process.env.INTERNAL_JOB_TOKEN?.trim();

  if (!adminToken && !internalToken) {
    res.status(503).json({
      error: 'Jobs internos indisponíveis.',
      code: 'JOBS_NOT_CONFIGURED',
    });
    return;
  }

  const header = req.header('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const bearer = match?.[1]?.trim();

  if (!bearer) {
    res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
    return;
  }

  if (adminToken && bearer === adminToken) {
    next();
    return;
  }

  if (internalToken && bearer === internalToken) {
    next();
    return;
  }

  res.status(401).json({ error: 'Não autorizado.', code: 'UNAUTHORIZED' });
}
