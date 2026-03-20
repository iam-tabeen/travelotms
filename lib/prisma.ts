import { PrismaClient } from '@prisma/client';

// 1. Create a standard, clean Prisma Client without the complicated adapters
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 2. Prevent Next.js from exhausting database connections during local development hot-reloads
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// 3. Save the instance globally in dev mode
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;