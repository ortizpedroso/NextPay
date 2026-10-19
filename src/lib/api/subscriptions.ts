import { dashboardAuthHeaders } from './dashboardAuth';

export type SubscriptionDto = {
  subscriptionPublicId: string;
  productPublicId: string | null;
  planTitle: string;
  priceCents: number;
  cadenceLabel: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  status: 'ACTIVE' | 'OVERDUE' | 'CANCELED';
  nextBillingAt: string;
  totalPaidCents: number;
};

export type SubscriptionPlanSummaryDto = {
  productPublicId: string | null;
  planTitle: string;
  cadenceLabel: string;
  priceCents: number;
  activeSubscribers: number;
  mrrCents: number;
};

export type SubscriptionMetricsDto = {
  mrrCents: number;
  activeSubscribers: number;
  overdueSubscribers: number;
  retentionPercent: number;
};

export async function fetchSubscriptions(): Promise<SubscriptionDto[]> {
  const response = await fetch('/api/v1/subscriptions', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { subscriptions: SubscriptionDto[] };
  return json.subscriptions;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlanSummaryDto[]> {
  const response = await fetch('/api/v1/subscriptions/plans', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return [];
  }
  const json = (await response.json()) as { plans: SubscriptionPlanSummaryDto[] };
  return json.plans;
}

export async function fetchSubscriptionMetrics(): Promise<SubscriptionMetricsDto | null> {
  const response = await fetch('/api/v1/subscriptions/metrics', {
    headers: dashboardAuthHeaders(false),
  });
  if (!response.ok) {
    return null;
  }
  const json = (await response.json()) as { metrics: SubscriptionMetricsDto };
  return json.metrics;
}
