import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  try {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/lunar_db';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool as any);
    const prisma = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    return prisma;
  } catch (error) {
    console.error('Prisma Initialization Error:', error);
    const pool = new Pool({ connectionString: 'postgresql://postgres:postgrespassword@localhost:5432/lunar_db' });
    const adapter = new PrismaPg(pool as any);
    return new PrismaClient({ adapter });
  }
}

// Keeping the export for compatibility, but it will now be a proxy or we update callers
export const prisma = getPrisma();
