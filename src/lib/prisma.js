import { PrismaClient } from '@prisma/client';

let prisma;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
    });
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    prisma = global.prisma;
  }
} catch (error) {
  console.error('Falha ao inicializar o Prisma Client:', error);
  prisma = null;
}

export default prisma;