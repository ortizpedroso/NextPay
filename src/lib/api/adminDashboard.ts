import type { WebhookLog } from '../../data/mockData';
import { dashboardAuthHeaders } from './dashboardAuth';

export async function fetchInboundWebhookEvents(): Promise<WebhookLog[]> {
  const response = await fetch('/api/v1/admin/dashboard/webhook-events', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { events: WebhookLog[] };
  return json.events;
}

export type FeeScheduleDto = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  billingModel: string;
  anticipationNote?: string;
  baseCost: { percentage: number; fixedCents: number };
  markup: { percentage: number; fixedCents: number };
  clientRate: { percentage: number; fixedCents: number };
};

export async function fetchFeeSchedule(): Promise<FeeScheduleDto[]> {
  const response = await fetch('/api/v1/admin/dashboard/fee-schedule', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { fees: FeeScheduleDto[] };
  return json.fees;
}
