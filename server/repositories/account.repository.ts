import { prisma } from '../db.js';

export async function findAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
  });
}

export async function updateAccountBalance(id: string, newBalanceCents: number) {
  return prisma.account.update({
    where: { id },
    data: { balanceCents: newBalanceCents },
  });
}
