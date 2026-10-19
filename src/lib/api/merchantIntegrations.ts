import { dashboardAuthHeaders } from './dashboardAuth';

export type IntegrationPlatform = 'woocommerce' | 'shopify' | 'nuvemshop';

export type IntegrationStatusDto = {
  platform: IntegrationPlatform;
  status: 'DISCONNECTED' | 'CONNECTABLE' | 'CONNECTED';
  connectedAt: string | null;
  docsPath: string | null;
};

export async function fetchMerchantIntegrationStatus(): Promise<IntegrationStatusDto[]> {
  const response = await fetch('/api/v1/merchant/integrations/status', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { integrations: IntegrationStatusDto[] };
  return json.integrations;
}

export type MerchantApiKeySummaryDto = {
  keyPublicId: string;
  maskedKey: string;
  createdAt: string;
  revokedAt: string | null;
};

export async function fetchMerchantApiKeys(): Promise<MerchantApiKeySummaryDto[]> {
  const response = await fetch('/api/v1/merchant/api-keys', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { apiKeys: MerchantApiKeySummaryDto[] };
  return json.apiKeys;
}

export async function rotateMerchantApiKey(): Promise<{
  apiKey: string;
  keyPublicId: string;
  maskedKey: string;
}> {
  const response = await fetch('/api/v1/merchant/api-keys/rotate', {
    method: 'POST',
    headers: dashboardAuthHeaders(),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Falha ao rotacionar chave de API.');
  }
  return (await response.json()) as { apiKey: string; keyPublicId: string; maskedKey: string };
}
