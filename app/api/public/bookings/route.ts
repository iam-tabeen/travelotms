import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer'; // <-- 1. NODEMAILER IMPORT KAREIN

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

        // --- NEW: Fetch Tour Title for the Email Subject ---
        const tour = await prisma.tour.findUnique({ where: { id: body.tourId } });
        const tourName = tour ? tour.title : "Custom Tour Request";

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

        // 5. --- NEW: SEND EMAIL NOTIFICATION ---
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            // Target Email: Pehle contactEmail check karega, na mili toh adminEmail par bhej dega
            const notifyEmail = tenant.contactEmail || tenant.adminEmail;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: notifyEmail,
                replyTo: body.email, // Agency directly "Reply" daba kar customer se baat kar sakti hai!
                subject: `🎉 New Booking Request: ${tourName} - ${body.fullName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E9F2; border-radius: 16px; background-color: #FAFAFA;">
                        <h2 style="color: #003580; margin-top: 0;">New Booking Request Received!</h2>
                        <p>You have received a new booking from your website.</p>
                        <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #E5E9F2;">
                            <p style="margin: 8px 0;"><strong>Customer:</strong> ${body.fullName}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${body.email}</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${body.phone}</p>
                            <p style="margin: 8px 0;"><strong>Tour:</strong> ${tourName}</p>
                            <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${body.travelDate}</p>
                            <p style="margin: 8px 0;"><strong>Travelers:</strong> ${body.travelers}</p>
                            <p style="margin: 8px 0;"><strong>Total Price:</strong> Rs. ${parseInt(body.finalPrice).toLocaleString()}</p>
                            ${body.selectedAddOns ? `<p style="margin: 8px 0;"><strong>Add-ons:</strong> ${body.selectedAddOns}</p>` : ''}
                            ${body.specialNotes ? `<p style="margin: 8px 0;"><strong>Notes:</strong> ${body.specialNotes}</p>` : ''}
                            ${body.isWaitlist ? `<p style="margin: 8px 0; color: #DC2626;"><strong>Status:</strong> Added to Waitlist</p>` : ''}
                        </div>
                        <p style="margin-top: 20px; font-size: 12px; color: #888;">Log in to your Axius Digital CRM dashboard to manage this booking and contact the customer.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Booking saved, but notification email failed:", emailError);
            // Notice: Humne isay try-catch mein rakha hai taake agar email fail bhi ho jaye, 
            // toh booking save ho jaye aur customer ko error show na ho.
        }

        // 6. Respond with success!
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

