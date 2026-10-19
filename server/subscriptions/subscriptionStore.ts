import type { PrismaClient } from '@prisma/client';

import {
  newSubscriptionCyclePublicId,
  newSubscriptionPublicId,
} from '../catalog/catalogIds';
import type {
  SubscriptionCycleRecord,
  SubscriptionMetrics,
  SubscriptionPlanSummary,
  SubscriptionRecord,
  SubscriptionStatus,
} from './subscriptionTypes';

export interface SubscriptionStore {
  list(merchantDbId?: string): Promise<SubscriptionRecord[]>;
  getByPublicId(
    subscriptionPublicId: string,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null>;
  create(
    input: {
      productPublicId?: string | null;
      planTitle: string;
      priceCents: number;
      cadenceLabel: string;
      customerName: string;
      customerEmail: string;
      paymentMethod: string;
      nextBillingAt: Date;
    },
    merchantDbId: string,
  ): Promise<SubscriptionRecord>;
  update(
    subscriptionPublicId: string,
    patch: Partial<{
      status: SubscriptionStatus;
      nextBillingAt: Date;
      totalPaidCents: number;
      paymentMethod: string;
    }>,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null>;
  cancel(subscriptionPublicId: string, merchantDbId?: string): Promise<SubscriptionRecord | null>;
  listPlanSummaries(merchantDbId?: string): Promise<SubscriptionPlanSummary[]>;
  metrics(merchantDbId?: string): Promise<SubscriptionMetrics>;
  listDuePendingCycles(now?: Date): Promise<
    Array<{
      cyclePublicId: string;
      subscriptionPublicId: string;
      merchantDbId: string;
      amountCents: number;
      customerEmail: string;
      planTitle: string;
    }>
  >;
  markCyclePaid(
    cyclePublicId: string,
    neutralPaymentId: string,
    nextBillingAt: Date,
  ): Promise<void>;
}

function mapCycle(row: {
  cyclePublicId: string;
  dueAt: Date;
  amountCents: number;
  status: string;
  neutralPaymentId: string | null;
}): SubscriptionCycleRecord {
  return {
    cyclePublicId: row.cyclePublicId,
    dueAt: row.dueAt.toISOString(),
    amountCents: row.amountCents,
    status: row.status as SubscriptionCycleRecord['status'],
    neutralPaymentId: row.neutralPaymentId,
  };
}

function mapSubscription(row: {
  subscriptionPublicId: string;
  productPublicId: string | null;
  planTitle: string;
  priceCents: number;
  cadenceLabel: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  status: string;
  nextBillingAt: Date;
  totalPaidCents: number;
  cycles: Array<{
    cyclePublicId: string;
    dueAt: Date;
    amountCents: number;
    status: string;
    neutralPaymentId: string | null;
  }>;
}): SubscriptionRecord {
  return {
    subscriptionPublicId: row.subscriptionPublicId,
    productPublicId: row.productPublicId,
    planTitle: row.planTitle,
    priceCents: row.priceCents,
    cadenceLabel: row.cadenceLabel,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    paymentMethod: row.paymentMethod,
    status: row.status as SubscriptionStatus,
    nextBillingAt: row.nextBillingAt.toISOString(),
    totalPaidCents: row.totalPaidCents,
    cycles: row.cycles.map(mapCycle),
  };
}

export class PrismaSubscriptionStore implements SubscriptionStore {
  constructor(private readonly prisma: PrismaClient) {}

  private includeCycles = {
    cycles: { orderBy: { dueAt: 'desc' as const }, take: 12 },
  };

  async list(merchantDbId?: string): Promise<SubscriptionRecord[]> {
    const rows = await this.prisma.subscription.findMany({
      where: merchantDbId ? { merchantId: merchantDbId } : undefined,
      include: this.includeCycles,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapSubscription);
  }

  async getByPublicId(
    subscriptionPublicId: string,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null> {
    const row = await this.prisma.subscription.findFirst({
      where: {
        subscriptionPublicId,
        ...(merchantDbId ? { merchantId: merchantDbId } : {}),
      },
      include: this.includeCycles,
    });
    return row ? mapSubscription(row) : null;
  }

  async create(
    input: {
      productPublicId?: string | null;
      planTitle: string;
      priceCents: number;
      cadenceLabel: string;
      customerName: string;
      customerEmail: string;
      paymentMethod: string;
      nextBillingAt: Date;
    },
    merchantDbId: string,
  ): Promise<SubscriptionRecord> {
    const subscriptionPublicId = newSubscriptionPublicId();
    const cyclePublicId = newSubscriptionCyclePublicId();

    const row = await this.prisma.subscription.create({
      data: {
        merchantId: merchantDbId,
        subscriptionPublicId,
        productPublicId: input.productPublicId ?? null,
        planTitle: input.planTitle,
        priceCents: input.priceCents,
        cadenceLabel: input.cadenceLabel,
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase(),
        paymentMethod: input.paymentMethod,
        status: 'ACTIVE',
        nextBillingAt: input.nextBillingAt,
        cycles: {
          create: {
            cyclePublicId,
            dueAt: input.nextBillingAt,
            amountCents: input.priceCents,
            status: 'PENDING',
          },
        },
      },
      include: this.includeCycles,
    });

    return mapSubscription(row);
  }

  async update(
    subscriptionPublicId: string,
    patch: Partial<{
      status: SubscriptionStatus;
      nextBillingAt: Date;
      totalPaidCents: number;
      paymentMethod: string;
    }>,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null> {
    const existing = await this.prisma.subscription.findFirst({
      where: {
        subscriptionPublicId,
        ...(merchantDbId ? { merchantId: merchantDbId } : {}),
      },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }

    const row = await this.prisma.subscription.update({
      where: { id: existing.id },
      data: patch,
      include: this.includeCycles,
    });
    return mapSubscription(row);
  }

  async cancel(subscriptionPublicId: string, merchantDbId?: string): Promise<SubscriptionRecord | null> {
    return this.update(subscriptionPublicId, { status: 'CANCELED' }, merchantDbId);
  }

  async listPlanSummaries(merchantDbId?: string): Promise<SubscriptionPlanSummary[]> {
    const rows = await this.prisma.subscription.findMany({
      where: {
        ...(merchantDbId ? { merchantId: merchantDbId } : {}),
        status: { in: ['ACTIVE', 'OVERDUE'] },
      },
      select: {
        productPublicId: true,
        planTitle: true,
        cadenceLabel: true,
        priceCents: true,
        status: true,
      },
    });

    const byPlan = new Map<string, SubscriptionPlanSummary>();
    for (const row of rows) {
      const key = `${row.productPublicId ?? ''}:${row.planTitle}`;
      const existing = byPlan.get(key);
      if (existing) {
        existing.activeSubscribers += 1;
        existing.mrrCents += row.priceCents;
      } else {
        byPlan.set(key, {
          productPublicId: row.productPublicId,
          planTitle: row.planTitle,
          cadenceLabel: row.cadenceLabel,
          priceCents: row.priceCents,
          activeSubscribers: 1,
          mrrCents: row.priceCents,
        });
      }
    }
    return [...byPlan.values()];
  }

  async metrics(merchantDbId?: string): Promise<SubscriptionMetrics> {
    const where = merchantDbId ? { merchantId: merchantDbId } : undefined;
    const [active, overdue, canceled] = await Promise.all([
      this.prisma.subscription.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { ...where, status: 'OVERDUE' } }),
      this.prisma.subscription.count({ where: { ...where, status: 'CANCELED' } }),
    ]);

    const mrrAgg = await this.prisma.subscription.aggregate({
      where: { ...where, status: { in: ['ACTIVE', 'OVERDUE'] } },
      _sum: { priceCents: true },
    });

    const everActive = active + overdue + canceled;
    const retentionPercent =
      everActive === 0 ? 100 : Math.round(((everActive - canceled) / everActive) * 1000) / 10;

    return {
      mrrCents: mrrAgg._sum.priceCents ?? 0,
      activeSubscribers: active,
      overdueSubscribers: overdue,
      retentionPercent,
    };
  }

  async listDuePendingCycles(now = new Date()): Promise<
    Array<{
      cyclePublicId: string;
      subscriptionPublicId: string;
      merchantDbId: string;
      amountCents: number;
      customerEmail: string;
      planTitle: string;
    }>
  > {
    const rows = await this.prisma.subscriptionCycle.findMany({
      where: {
        status: 'PENDING',
        dueAt: { lte: now },
        subscription: { status: { in: ['ACTIVE', 'OVERDUE'] } },
      },
      include: {
        subscription: {
          select: {
            subscriptionPublicId: true,
            merchantId: true,
            customerEmail: true,
            planTitle: true,
          },
        },
      },
      take: 50,
    });

    return rows.map((row) => ({
      cyclePublicId: row.cyclePublicId,
      subscriptionPublicId: row.subscription.subscriptionPublicId,
      merchantDbId: row.subscription.merchantId,
      amountCents: row.amountCents,
      customerEmail: row.subscription.customerEmail,
      planTitle: row.subscription.planTitle,
    }));
  }

  async markCyclePaid(
    cyclePublicId: string,
    neutralPaymentId: string,
    nextBillingAt: Date,
  ): Promise<void> {
    const cycle = await this.prisma.subscriptionCycle.findUnique({
      where: { cyclePublicId },
      include: { subscription: true },
    });
    if (!cycle) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.subscriptionCycle.update({
        where: { id: cycle.id },
        data: { status: 'PAID', neutralPaymentId },
      }),
      this.prisma.subscription.update({
        where: { id: cycle.subscriptionId },
        data: {
          totalPaidCents: { increment: cycle.amountCents },
          nextBillingAt,
          status: 'ACTIVE',
        },
      }),
      this.prisma.subscriptionCycle.create({
        data: {
          subscriptionId: cycle.subscriptionId,
          cyclePublicId: newSubscriptionCyclePublicId(),
          dueAt: nextBillingAt,
          amountCents: cycle.subscription.priceCents,
          status: 'PENDING',
        },
      }),
    ]);
  }
}

export class InMemorySubscriptionStore implements SubscriptionStore {
  private readonly rows = new Map<
    string,
    SubscriptionRecord & { merchantDbId: string; internalId: string }
  >();

  async list(merchantDbId?: string): Promise<SubscriptionRecord[]> {
    return [...this.rows.values()]
      .filter((row) => !merchantDbId || row.merchantDbId === merchantDbId)
      .map(({ merchantDbId: _m, internalId: _i, ...record }) => record);
  }

  async getByPublicId(
    subscriptionPublicId: string,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null> {
    const row = this.rows.get(subscriptionPublicId);
    if (!row) {
      return null;
    }
    if (merchantDbId && row.merchantDbId !== merchantDbId) {
      return null;
    }
    const { merchantDbId: _m, internalId: _i, ...record } = row;
    return record;
  }

  async create(
    input: {
      productPublicId?: string | null;
      planTitle: string;
      priceCents: number;
      cadenceLabel: string;
      customerName: string;
      customerEmail: string;
      paymentMethod: string;
      nextBillingAt: Date;
    },
    merchantDbId: string,
  ): Promise<SubscriptionRecord> {
    const subscriptionPublicId = newSubscriptionPublicId();
    const cyclePublicId = newSubscriptionCyclePublicId();
    const record: SubscriptionRecord & { merchantDbId: string; internalId: string } = {
      subscriptionPublicId,
      productPublicId: input.productPublicId ?? null,
      planTitle: input.planTitle,
      priceCents: input.priceCents,
      cadenceLabel: input.cadenceLabel,
      customerName: input.customerName,
      customerEmail: input.customerEmail.toLowerCase(),
      paymentMethod: input.paymentMethod,
      status: 'ACTIVE',
      nextBillingAt: input.nextBillingAt.toISOString(),
      totalPaidCents: 0,
      cycles: [
        {
          cyclePublicId,
          dueAt: input.nextBillingAt.toISOString(),
          amountCents: input.priceCents,
          status: 'PENDING',
          neutralPaymentId: null,
        },
      ],
      merchantDbId,
      internalId: subscriptionPublicId,
    };
    this.rows.set(subscriptionPublicId, record);
    const { merchantDbId: _m, internalId: _i, ...created } = record;
    return created;
  }

  async update(
    subscriptionPublicId: string,
    patch: Partial<{
      status: SubscriptionStatus;
      nextBillingAt: Date;
      totalPaidCents: number;
      paymentMethod: string;
    }>,
    merchantDbId?: string,
  ): Promise<SubscriptionRecord | null> {
    const row = this.rows.get(subscriptionPublicId);
    if (!row || (merchantDbId && row.merchantDbId !== merchantDbId)) {
      return null;
    }
    if (patch.status) {
      row.status = patch.status;
    }
    if (patch.nextBillingAt) {
      row.nextBillingAt = patch.nextBillingAt.toISOString();
    }
    if (patch.totalPaidCents !== undefined) {
      row.totalPaidCents = patch.totalPaidCents;
    }
    if (patch.paymentMethod) {
      row.paymentMethod = patch.paymentMethod;
    }
    return this.getByPublicId(subscriptionPublicId, merchantDbId);
  }

  async cancel(subscriptionPublicId: string, merchantDbId?: string): Promise<SubscriptionRecord | null> {
    return this.update(subscriptionPublicId, { status: 'CANCELED' }, merchantDbId);
  }

  async listPlanSummaries(merchantDbId?: string): Promise<SubscriptionPlanSummary[]> {
    const subs = await this.list(merchantDbId);
    const byPlan = new Map<string, SubscriptionPlanSummary>();
    for (const sub of subs.filter((s) => s.status === 'ACTIVE' || s.status === 'OVERDUE')) {
      const key = `${sub.productPublicId ?? ''}:${sub.planTitle}`;
      const existing = byPlan.get(key);
      if (existing) {
        existing.activeSubscribers += 1;
        existing.mrrCents += sub.priceCents;
      } else {
        byPlan.set(key, {
          productPublicId: sub.productPublicId,
          planTitle: sub.planTitle,
          cadenceLabel: sub.cadenceLabel,
          priceCents: sub.priceCents,
          activeSubscribers: 1,
          mrrCents: sub.priceCents,
        });
      }
    }
    return [...byPlan.values()];
  }

  async metrics(merchantDbId?: string): Promise<SubscriptionMetrics> {
    const subs = await this.list(merchantDbId);
    const active = subs.filter((s) => s.status === 'ACTIVE').length;
    const overdue = subs.filter((s) => s.status === 'OVERDUE').length;
    const canceled = subs.filter((s) => s.status === 'CANCELED').length;
    const mrrCents = subs
      .filter((s) => s.status === 'ACTIVE' || s.status === 'OVERDUE')
      .reduce((sum, s) => sum + s.priceCents, 0);
    const everActive = active + overdue + canceled;
    const retentionPercent =
      everActive === 0 ? 100 : Math.round(((everActive - canceled) / everActive) * 1000) / 10;
    return { mrrCents, activeSubscribers: active, overdueSubscribers: overdue, retentionPercent };
  }

  async listDuePendingCycles(now = new Date()): Promise<
    Array<{
      cyclePublicId: string;
      subscriptionPublicId: string;
      merchantDbId: string;
      amountCents: number;
      customerEmail: string;
      planTitle: string;
    }>
  > {
    const due: Array<{
      cyclePublicId: string;
      subscriptionPublicId: string;
      merchantDbId: string;
      amountCents: number;
      customerEmail: string;
      planTitle: string;
    }> = [];
    for (const row of this.rows.values()) {
      if (row.status !== 'ACTIVE' && row.status !== 'OVERDUE') {
        continue;
      }
      for (const cycle of row.cycles) {
        if (cycle.status === 'PENDING' && new Date(cycle.dueAt) <= now) {
          due.push({
            cyclePublicId: cycle.cyclePublicId,
            subscriptionPublicId: row.subscriptionPublicId,
            merchantDbId: row.merchantDbId,
            amountCents: cycle.amountCents,
            customerEmail: row.customerEmail,
            planTitle: row.planTitle,
          });
        }
      }
    }
    return due;
  }

  async markCyclePaid(
    cyclePublicId: string,
    neutralPaymentId: string,
    nextBillingAt: Date,
  ): Promise<void> {
    for (const row of this.rows.values()) {
      const cycle = row.cycles.find((c) => c.cyclePublicId === cyclePublicId);
      if (!cycle) {
        continue;
      }
      cycle.status = 'PAID';
      cycle.neutralPaymentId = neutralPaymentId;
      row.totalPaidCents += cycle.amountCents;
      row.nextBillingAt = nextBillingAt.toISOString();
      row.status = 'ACTIVE';
      row.cycles.unshift({
        cyclePublicId: newSubscriptionCyclePublicId(),
        dueAt: nextBillingAt.toISOString(),
        amountCents: row.priceCents,
        status: 'PENDING',
        neutralPaymentId: null,
      });
      return;
    }
  }
}
