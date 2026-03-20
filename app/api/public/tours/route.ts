import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This allows external domains (like fasttravels.pk) to request data without being blocked by browser security
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, you can restrict this to the specific client's domain
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    try {
        // 1. Get the Tenant ID from the URL (e.g., ?tenantId=123-abc)
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: "Missing tenantId parameter." }, { status: 400, headers: corsHeaders });
        }

        // 2. THE KILL SWITCH CHECK
        // Fetch the tenant to make sure they are active
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { isActive: true }
        });

        // If the agency doesn't exist OR you suspended them from your Super Admin dashboard...
        if (!tenant || !tenant.isActive) {
            return NextResponse.json({ 
                error: "This agency's account is currently suspended or inactive." 
            }, { status: 403, headers: corsHeaders });
        }

        // 3. FETCH THE TOURS
        // If they are active, fetch all their tours to display on their website
        const tours = await prisma.tour.findMany({
            where: { 
                tenantId: tenantId,
                // You might have a 'status' field in the future like 'PUBLISHED', you could add that here!
            },
            orderBy: { createdAt: 'desc' }
        });

        // 4. Send the JSON data to the client's frontend website
        return NextResponse.json({ 
            success: true, 
            count: tours.length, 
            tours 
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}

