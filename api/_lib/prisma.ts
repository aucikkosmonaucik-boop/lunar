import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
let prisma: PrismaClient;

try {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (error) {
  console.error('Prisma Initialization Error:', error);
  // Fallback to a plain PrismaClient if adapter fails, or throw later in the handler
  prisma = new PrismaClient();
}

export { prisma };
