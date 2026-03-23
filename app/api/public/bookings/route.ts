import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
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

        // 2. Parse the incoming booking payload
        const body = await request.json();

        // Basic Validation
        if (!body.tourId || !body.fullName || !body.email || !body.travelDate) {
            return NextResponse.json({ error: "Missing required booking details." }, { status: 400, headers: corsHeaders });
        }

        // 3. Create the Booking in the Database
        const newBooking = await prisma.booking.create({
            data: {
                tenantId: tenant.id,
                tourId: body.tourId,
                customerName: body.fullName,
                customerEmail: body.email,
                customerPhone: body.phone,
                travelDate: new Date(body.travelDate),
                numTravelers: parseInt(body.travelers),
                specialNotes: body.specialNotes || '',
                selectedAddOns: body.selectedAddOns || '',
                totalPrice: parseInt(body.finalPrice),
                status: 'PENDING',
                isWaitlist: body.isWaitlist || false,
                paymentStatus: 'UNPAID',
                amountPaid: 0
            }
        });

        // 4. (Optional) If a promo code was used, increment its usage counter!
        if (body.promoCodeId) {
            await prisma.promoCode.update({
                where: { id: body.promoCodeId },
                data: { timesUsed: { increment: 1 } }
            });
        }

        // 5. Respond with success!
        return NextResponse.json({ 
            success: true, 
            message: body.isWaitlist ? "Added to waitlist!" : "Booking requested successfully!",
            bookingId: newBooking.id
        }, { status: 201, headers: corsHeaders });

    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}