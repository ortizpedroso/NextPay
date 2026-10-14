import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não está configurada no ambiente. Configure uma URL válida de PostgreSQL para iniciar a aplicação.',
  );
}

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
