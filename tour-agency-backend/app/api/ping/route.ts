import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // This tiny database call is just enough to tell Supabase "I am active!"
    await prisma.tour.findFirst({ select: { id: true } });
    return NextResponse.json({ status: 'Database is awake! 🚀' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to wake database' }, { status: 500 });
  }
}