import { Router } from 'express';

import { prisma } from '../../db/prisma';
import type { DashboardRequest } from '../../merchant/merchantScope';
import { getDefaultMerchantDbId, resolveMerchantDbIdForRead } from '../../merchant/merchantScope';

export const INTEGRATION_PLATFORMS = ['woocommerce', 'shopify', 'nuvemshop'] as const;
export type IntegrationPlatform = (typeof INTEGRATION_PLATFORMS)[number];

export type IntegrationStatusDto = {
  platform: IntegrationPlatform;
  status: 'DISCONNECTED' | 'CONNECTABLE' | 'CONNECTED';
  connectedAt: string | null;
  docsPath: string | null;
};

const DOCS_BY_PLATFORM: Partial<Record<IntegrationPlatform, string>> = {
  woocommerce: '/integrations/woocommerce/README.md',
};

export async function resolveIntegrationStatuses(
  merchantDbId: string,
): Promise<IntegrationStatusDto[]> {
  const rows = await prisma.merchantIntegration.findMany({
    where: { merchantId: merchantDbId },
  });
  const byPlatform = new Map(rows.map((row) => [row.platform, row]));

  return INTEGRATION_PLATFORMS.map((platform) => {
    const row = byPlatform.get(platform);
    const status =
      (row?.status as IntegrationStatusDto['status'] | undefined) ?? ('CONNECTABLE' as const);
    return {
      platform,
      status: status === 'DISCONNECTED' ? 'CONNECTABLE' : status,
      connectedAt: row?.connectedAt?.toISOString() ?? null,
      docsPath: DOCS_BY_PLATFORM[platform] ?? null,
    };
  });
}

export function createMerchantIntegrationsRouter(): Router {
  const router = Router();

  router.get('/status', async (req, res, next) => {
    try {
      const merchantDbId =
        (await resolveMerchantDbIdForRead(req as DashboardRequest)) ??
        (await getDefaultMerchantDbId());
      try {
        const integrations = await resolveIntegrationStatuses(merchantDbId);
        res.json({ integrations });
      } catch {
        res.json({
          integrations: INTEGRATION_PLATFORMS.map((platform) => ({
            platform,
            status: 'CONNECTABLE' as const,
            connectedAt: null,
            docsPath: DOCS_BY_PLATFORM[platform] ?? null,
          })),
        });
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
}
