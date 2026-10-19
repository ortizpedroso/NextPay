import { randomBytes } from 'node:crypto';

import { prisma } from '../db/prisma';
import type { WithdrawalRecord, WithdrawalStatus } from './withdrawalAdapter';
import { resolveWithdrawalAdapter } from './withdrawalAdapter';
import {
  enqueueWithdrawalStub,
  getWithdrawalStub,
  listWithdrawalStubs,
  resetWithdrawalStubStoreForTests,
} from './withdrawalStubStore';

function newProtocol(): string {
  return `wd_${Date.now().toString(36)}_${randomBytes(3).toString('hex')}`;
}

function advanceFixtureStatus(row: {
  status: string;
  createdAt: Date;
  message: string;
}): { status: WithdrawalStatus; message: string } {
  const ageMs = Date.now() - row.createdAt.getTime();
  let status = row.status as WithdrawalStatus;
  let message = row.message;
  if (status === 'QUEUED' && ageMs > 2_000) {
    status = 'PROCESSING';
    message = 'Liquidação Pix em processamento (simulado).';
  }
  if (status === 'PROCESSING' && ageMs > 5_000) {
    status = 'COMPLETED';
    message = 'Saque concluído em ambiente simulado.';
  }
  return { status, message };
}

function mapPrismaRow(row: {
  protocol: string;
  amountCents: number;
  pixKey: string;
  status: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}): WithdrawalRecord {
  const mode = process.env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
  const isFixture = mode === 'fixture' || mode === 'in_memory';
  const advanced = isFixture ? advanceFixtureStatus(row) : { status: row.status as WithdrawalStatus, message: row.message };
  return {
    protocol: row.protocol,
    amountCents: row.amountCents,
    pixKey: row.pixKey,
    status: advanced.status,
    message: advanced.message,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createWithdrawalRequest(
  merchantDbId: string,
  input: { amountCents: number; pixKey: string },
): Promise<WithdrawalRecord> {
  const protocol = newProtocol();
  const adapter = resolveWithdrawalAdapter();
  const submit = await adapter.submit({ ...input, protocol });

  try {
    const row = await prisma.withdrawalRequest.create({
      data: {
        merchantId: merchantDbId,
        protocol,
        amountCents: input.amountCents,
        pixKey: input.pixKey,
        status: submit.status,
        message: submit.message,
      },
    });
    return mapPrismaRow(row);
  } catch {
    const stub = enqueueWithdrawalStub(input);
    return stub;
  }
}

export async function getWithdrawalRequest(
  merchantDbId: string | undefined,
  protocol: string,
): Promise<WithdrawalRecord | null> {
  try {
    const row = await prisma.withdrawalRequest.findUnique({ where: { protocol } });
    if (!row) {
      return getWithdrawalStub(protocol);
    }
    if (merchantDbId && row.merchantId !== merchantDbId) {
      return null;
    }

    const mode = process.env.PAYMENT_GATEWAY_MODE?.trim().toLowerCase();
    const isFixture = mode === 'fixture' || mode === 'in_memory';
    if (isFixture) {
      const advanced = advanceFixtureStatus(row);
      if (advanced.status !== row.status || advanced.message !== row.message) {
        await prisma.withdrawalRequest.update({
          where: { protocol },
          data: { status: advanced.status, message: advanced.message },
        });
      }
    }

    const refreshed = await prisma.withdrawalRequest.findUnique({ where: { protocol } });
    return refreshed ? mapPrismaRow(refreshed) : null;
  } catch {
    return getWithdrawalStub(protocol);
  }
}

export async function listWithdrawalRequests(
  merchantDbId: string | undefined,
): Promise<WithdrawalRecord[]> {
  try {
    const rows = await prisma.withdrawalRequest.findMany({
      where: merchantDbId ? { merchantId: merchantDbId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((row) => mapPrismaRow(row));
  } catch {
    return listWithdrawalStubs();
  }
}

export { resetWithdrawalStubStoreForTests };
