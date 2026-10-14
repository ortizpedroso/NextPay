import { Router } from 'express';
import { getCurrentAccountId } from '../lib/auth.js';
import { getDashboardMetrics } from '../repositories/dashboard.repository.js';

export const dashboardRouter = Router();

dashboardRouter.get('/dashboard', async (req, res, next) => {
  try {
    const accountId = getCurrentAccountId();
    const daysParam = parseInt(req.query.days as string, 10);
    const days = [7, 14, 30].includes(daysParam) ? daysParam : 30;

    const data = await getDashboardMetrics(accountId, days);
    res.json(data);
  } catch (err) {
    next(err);
  }
});
