import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// 1. Handle OPTIONS request for CORS preflight (Browser security requirement)
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// 2. Handle the incoming POST request from the client's contact form
export async function POST(request: Request) {
    try {
        // A. SECURITY CHECK: Verify the API Key
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json({ error: "Unauthorized: Missing API Key." }, { status: 401, headers: corsHeaders });
        }

        const validKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { tenant: true }
        });

        if (!validKey) {
            return NextResponse.json({ error: "Unauthorized: Invalid API Key." }, { status: 401, headers: corsHeaders });
        }

        const tenant = validKey.tenant;

        // B. KILL SWITCH: Ensure the agency is still active
        if (!tenant || !tenant.isActive) {
            return NextResponse.json({ 
                error: "This agency's account is currently suspended. Form submissions are disabled." 
            }, { status: 403, headers: corsHeaders });
        }

        // C. PARSE THE INCOMING DATA
        const body = await request.json();
        
        // Basic validation: Ensure required fields are present
        if (!body.fullName || !body.email || !body.phone) {
             return NextResponse.json({ 
                error: "Missing required fields. Full Name, Email, and Phone are required." 
            }, { status: 400, headers: corsHeaders });
        }

        // D. SAVE TO DATABASE
        // Notice we forcefully apply the tenant.id from the API key, 
        // ensuring a hacker can't send a fake tenantId in the body!
        const newLead = await prisma.customTourLead.create({
            data: {
                tenantId: tenant.id,
                fullName: body.fullName,
                email: body.email,
                phone: body.phone,
                cityCountry: body.cityCountry || '',
                dateFrom: body.dateFrom || '',
                dateTo: body.dateTo || '',
                travelers: body.travelers || '1',
                accommodation: body.accommodation || '',
                budget: body.budget || '',
                destinations: body.destinations || '',
                tourTypes: body.tourTypes || '',
                requirements: body.requirements || '',
                status: 'PENDING'
            }
        });

        // E. SEND SUCCESS RESPONSE
        return NextResponse.json({ 
            success: true, 
            message: "Lead successfully submitted!",
            leadId: newLead.id 
        }, { status: 201, headers: corsHeaders });

    } catch (error) {
        console.error("Public API POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}