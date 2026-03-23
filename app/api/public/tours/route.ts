import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This allows external domains (like fasttravels.pk) to request data without being blocked by browser security
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, you can restrict this to the specific client's domain
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    // IMPORTANT: Added 'x-api-key' to allowed headers so browsers don't block the request
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    try {
        // 1. Get the API Key securely from the Headers (NOT the URL)
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json({ error: "Unauthorized: Missing API Key." }, { status: 401, headers: corsHeaders });
        }

        // 2. Validate the API Key and fetch the connected Tenant
        const validKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { tenant: true } // Bring the tenant data along with the key
        });

        // If the key doesn't exist in your database...
        if (!validKey) {
            return NextResponse.json({ error: "Unauthorized: Invalid API Key." }, { status: 401, headers: corsHeaders });
        }

        const tenant = validKey.tenant;

        // 3. THE KILL SWITCH CHECK
        // If the agency doesn't exist OR you suspended them from your Super Admin dashboard...
        if (!tenant || !tenant.isActive) {
            return NextResponse.json({ 
                error: "This agency's account is currently suspended or inactive." 
            }, { status: 403, headers: corsHeaders });
        }

        // 4. FETCH THE TOURS
        // Securely use the tenantId that we proved belongs to this exact API key
        const tours = await prisma.tour.findMany({
            where: { 
                tenantId: tenant.id,
                // You might have a 'status' field in the future like 'PUBLISHED', you could add that here!
            },
            orderBy: { createdAt: 'desc' }
        });

        // 5. Send the JSON data to the client's frontend website
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
            },
            count: tours.length, 
            tours 
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}