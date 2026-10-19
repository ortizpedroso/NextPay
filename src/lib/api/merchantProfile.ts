import { dashboardAuthHeaders } from './dashboardAuth';

export type MerchantProfileDto = {
  merchantId: string;
  displayName: string;
  email: string;
  ledgerTransactionCount: number;
  grossVolumeCents: number;
  availableBalanceCents: number;
};

export async function fetchMerchantProfile(): Promise<MerchantProfileDto | null> {
  const response = await fetch('/api/v1/merchant/auth/me', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as { merchant: MerchantProfileDto };
  return json.merchant;
}
