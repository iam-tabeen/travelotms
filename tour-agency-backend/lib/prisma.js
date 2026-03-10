import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Using the exact same connection that worked for your seed script
const connectionString = "postgresql://postgres.lsaftvaudadtxfhcpjpq:TabeenSupabasse990s@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// This ensures Next.js doesn't open too many connections during development
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;