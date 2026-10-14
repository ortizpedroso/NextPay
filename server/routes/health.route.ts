import { Router } from 'express';
import { prisma } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  res.status(dbOk ? 200 : 503).json({
    ok: true,
    db: dbOk,
  });
});
