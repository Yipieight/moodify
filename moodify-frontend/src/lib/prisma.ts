import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log database URL for debugging (only show if it exists, not the full value for security)
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL is set:', process.env.DATABASE_URL.substring(0, 20) + '...')
} else {
  console.error('WARNING: DATABASE_URL is not set!')
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Aseguramos que en desarrollo no haya múltiples instancias
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Exportar una función para asegurar la conexión antes de usarla
export async function connectPrisma(): Promise<PrismaClient> {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
    return prisma;
  } catch (error) {
    console.error('Error connecting to Prisma:', error);
    throw error;
  }
}