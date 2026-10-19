export type SubscriptionStatus = 'ACTIVE' | 'OVERDUE' | 'CANCELED';
export type SubscriptionCycleStatus = 'PENDING' | 'PAID' | 'FAILED';

export type SubscriptionCycleRecord = {
  cyclePublicId: string;
  dueAt: string;
  amountCents: number;
  status: SubscriptionCycleStatus;
  neutralPaymentId: string | null;
};

export type SubscriptionRecord = {
  subscriptionPublicId: string;
  productPublicId: string | null;
  planTitle: string;
  priceCents: number;
  cadenceLabel: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  status: SubscriptionStatus;
  nextBillingAt: string;
  totalPaidCents: number;
  cycles: SubscriptionCycleRecord[];
};

export type SubscriptionPlanSummary = {
  productPublicId: string | null;
  planTitle: string;
  cadenceLabel: string;
  priceCents: number;
  activeSubscribers: number;
  mrrCents: number;
};

export type SubscriptionMetrics = {
  mrrCents: number;
  activeSubscribers: number;
  overdueSubscribers: number;
  retentionPercent: number;
};
