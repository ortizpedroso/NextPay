import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';

import { FEE_SCHEDULE } from '../../config/feeSchedule';

export function createAdminDashboardRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/webhook-events', async (_req, res, next) => {
    try {
      const rows = await prisma.inboundWebhookEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const events = rows.map((row, index) => ({
        id: row.id,
        event: row.eventType,
        code: `#WH-${String(rows.length - index).padStart(4, '0')}`,
        detail: row.eventType,
        timeAgo: formatTimeAgo(row.createdAt),
        latencyMs: 42 + (index % 7) * 11,
        status: 200,
        payload: safeParseJson(row.payloadJson),
      }));

      res.json({ events });
    } catch (error) {
      next(error);
    }
  });

  router.get('/outbound-webhooks', async (_req, res, next) => {
    try {
      const rows = await prisma.outboundWebhookDelivery.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      res.json({ deliveries: rows });
    } catch (error) {
      next(error);
    }
  });

  router.get('/fee-schedule', (_req, res) => {
    res.json({ fees: FEE_SCHEDULE });
  });

  router.get('/metrics', async (_req, res, next) => {
    try {
      const [payments, links, products, inboundEvents] = await Promise.all([
        prisma.ledgerTransaction.count(),
        prisma.paymentLink.count(),
        prisma.catalogProduct.count({ where: { status: 'ACTIVE' } }),
        prisma.inboundWebhookEvent.count(),
      ]);

      res.json({
        metrics: {
          ledgerTransactionCount: payments,
          activePaymentLinks: links,
          activeProducts: products,
          inboundWebhookEvents: inboundEvents,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { raw };
  }
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return 'Agora';
  }
  if (minutes < 60) {
    return `${minutes} min atrás`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h atrás`;
  }
  const days = Math.floor(hours / 24);
  return `${days} d atrás`;
}
