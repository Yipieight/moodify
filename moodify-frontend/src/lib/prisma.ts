import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Aumentamos el nivel de logging
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