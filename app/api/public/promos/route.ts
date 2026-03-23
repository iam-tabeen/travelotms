import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    try {
        // 1. Authenticate the API Key
        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) return NextResponse.json({ error: "Unauthorized: Missing API Key." }, { status: 401, headers: corsHeaders });

        const validKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { tenant: true }
        });

        if (!validKey || !validKey.tenant.isActive) {
            return NextResponse.json({ error: "Unauthorized or Suspended Account." }, { status: 403, headers: corsHeaders });
        }

        const tenant = validKey.tenant;

        // 2. Extract the promo code from the URL (e.g., ?code=SUMMER25)
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "Promo code is required." }, { status: 400, headers: corsHeaders });
        }

        // 3. Find and Validate the Promo
        const promo = await prisma.promoCode.findUnique({
            where: {
                tenantId_code: { tenantId: tenant.id, code: code }
            }
        });

        if (!promo) return NextResponse.json({ error: "Invalid promo code." }, { status: 404, headers: corsHeaders });
        if (!promo.isActive) return NextResponse.json({ error: "This promo code is no longer active." }, { status: 400, headers: corsHeaders });
        
        if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
            return NextResponse.json({ error: "This promo code has expired." }, { status: 400, headers: corsHeaders });
        }
        
        if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
            return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400, headers: corsHeaders });
        }

        // 4. Send back the good news
        return NextResponse.json({ 
            success: true, 
            promo: {
                id: promo.id,
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue
            }
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Promo API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}