import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    // x-api-key hata diya hai kyunke ab public route hai
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        // 1. Get agencyId from URL URL query parameters
        const { searchParams } = new URL(request.url);
        const agencyId = searchParams.get('agencyId');

        if (!agencyId) {
            return NextResponse.json({ error: "Missing Agency ID." }, { status: 400, headers: corsHeaders });
        }

        // 2. Validate the Agency directly
        const tenant = await prisma.tenant.findUnique({
            where: { id: agencyId }
        });

        if (!tenant || !tenant.isActive) {
            return NextResponse.json({ error: "Agency not found or Suspended Account." }, { status: 403, headers: corsHeaders });
        }

        // 3. Fetch the specific tour WITH its itinerary days
        const tour = await prisma.tour.findUnique({
            where: { 
                id: id,
                tenantId: tenant.id, // Security: Ensure this agency actually owns this specific tour ID
                status: 'ACTIVE'
            },
            include: {
                itineraryDays: {
                    orderBy: { dayNumber: 'asc' }
                }
            }
        });

        if (!tour) {
            return NextResponse.json({ error: "Tour not found." }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({ 
            success: true, 
            agency: {
                companyName: tenant.companyName,
                logoUrl: tenant.logoUrl,
                primaryColor: tenant.primaryColor,
                accentColor: tenant.accentColor,
                navbarColor: tenant.navbarColor,
                buttonColor: tenant.buttonColor,
                headingColor: tenant.headingColor,
                footerColor: tenant.footerColor,
                cardColor: tenant.cardColor,
                navlink: tenant.navlink,
                planTier: tenant.planTier
            },
            tour 
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Single Tour API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}