import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer'; // <-- 1. NODEMAILER IMPORT KAREIN

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

        // E. --- NEW: SEND EMAIL NOTIFICATION ---
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
                replyTo: body.email, // Agency directly "Reply" daba kar client se baat kar sakti hai
                subject: `🎯 New Custom Trip Request: ${body.fullName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E9F2; border-radius: 16px; background-color: #FAFAFA;">
                        <h2 style="color: #003580; margin-top: 0;">New Custom Tour Lead!</h2>
                        <p>A client has requested a custom itinerary from your website.</p>
                        <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #E5E9F2;">
                            <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Client Details</h3>
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${body.fullName}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> ${body.email}</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${body.phone}</p>
                            <p style="margin: 8px 0;"><strong>City/Country:</strong> ${body.cityCountry || 'N/A'}</p>

                            <h3 style="margin-top: 20px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Trip Preferences</h3>
                            <p style="margin: 8px 0;"><strong>Destinations:</strong> ${body.destinations || 'Not specified'}</p>
                            <p style="margin: 8px 0;"><strong>Dates:</strong> ${body.dateFrom || 'Flexible'} to ${body.dateTo || 'Flexible'}</p>
                            <p style="margin: 8px 0;"><strong>Travelers:</strong> ${body.travelers}</p>
                            <p style="margin: 8px 0;"><strong>Tour Type:</strong> ${body.tourTypes || 'Not specified'}</p>
                            <p style="margin: 8px 0;"><strong>Accommodation:</strong> ${body.accommodation || 'Not specified'}</p>
                            <p style="margin: 8px 0;"><strong>Budget:</strong> ${body.budget || 'Not specified'}</p>
                            
                            ${body.requirements ? `<h3 style="margin-top: 20px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Special Requirements</h3><p style="margin: 8px 0; white-space: pre-wrap;">${body.requirements}</p>` : ''}
                        </div>
                        <p style="margin-top: 20px; font-size: 12px; color: #888;">Log in to your Axius Digital CRM dashboard to manage this lead and create a custom proposal.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Lead saved, but notification email failed:", emailError);
            // Notice: Isay try-catch mein rakha hai taake email fail hone par bhi database mein lead save ho jaye
        }

        // F. SEND SUCCESS RESPONSE
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