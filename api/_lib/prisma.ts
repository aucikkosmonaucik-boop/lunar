import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('DATABASE_URL is missing, using default PrismaClient');
      return new PrismaClient();
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool as any);
    const prisma = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    return prisma;
  } catch (error) {
    console.error('Prisma Initialization Error:', error);
    return new PrismaClient();
  }
}

// Keeping the export for compatibility, but it will now be a proxy or we update callers
export const prisma = getPrisma();
