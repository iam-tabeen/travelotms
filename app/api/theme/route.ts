import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust this import path to where your Prisma client lives

export async function GET(request: Request) {
  // 1. Get the agencyId from the URL
  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agencyId');

  if (!agencyId) {
    return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
  }

  try {
    // 2. Query your Supabase Tenant table via Prisma
    const tenantTheme = await prisma.tenant.findUnique({
      where: { 
        id: agencyId 
      },
      select: {
        companyName: true,
        logoUrl: true,
        accentColor: true,
        buttonColor: true,
        cardColor: true,
        footerColor: true,
        navlink: true
      }
    });

    // 3. If no tenant is found, return a 404
    if (!tenantTheme) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // 4. Return the theme data to the frontend!
    return NextResponse.json(tenantTheme);

  } catch (error) {
    console.error("Theme API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}