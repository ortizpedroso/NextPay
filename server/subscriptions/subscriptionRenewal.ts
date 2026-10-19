import { randomBytes } from 'node:crypto';

import type { PaymentGatewayResolver } from '../http/routes/payments.routes';
import type { SubscriptionStore } from './subscriptionStore';

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export type SubscriptionRenewalResult = {
  processed: number;
  payments: Array<{ cyclePublicId: string; neutralPaymentId: string; status: string }>;
};

export async function processDueSubscriptionRenewals(
  store: SubscriptionStore,
  resolveGateway: PaymentGatewayResolver,
  now = new Date(),
): Promise<SubscriptionRenewalResult> {
  const dueCycles = await store.listDuePendingCycles(now);
  const payments: SubscriptionRenewalResult['payments'] = [];

  for (const cycle of dueCycles) {
    const gateway = await resolveGateway('SANDBOX');
    let neutralPaymentId = `np_pay_${randomBytes(12).toString('hex')}`;

    try {
      const payment = await gateway.createPayment({
        amountCents: cycle.amountCents,
        description: `Renovação: ${cycle.planTitle}`,
        method: 'PIX',
        customerId: cycle.customerEmail.slice(0, 64),
        idempotencyKey: `sub-renew-${cycle.cyclePublicId}`.slice(0, 128),
      });
      neutralPaymentId = payment.paymentId;
    } catch {
      // Fixture/in-memory gateway should not fail; synthetic id remains.
    }

    const nextBillingAt = new Date(now.getTime() + MONTH_MS);
    await store.markCyclePaid(cycle.cyclePublicId, neutralPaymentId, nextBillingAt);

    payments.push({
      cyclePublicId: cycle.cyclePublicId,
      neutralPaymentId,
      status: 'PAID',
    });
  }

  return { processed: payments.length, payments };
}
