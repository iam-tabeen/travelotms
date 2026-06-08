import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createBackup } from '@/app/actions/backup-actions';
import { Resend } from 'resend';

// ✅ THE FIX: Safely initialize Resend. 
// If process.env is empty (like during Vercel's build step), it uses the dummy string and doesn't crash!
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function GET(request: Request) {
    // 1. SECURITY CHECK: Ensure this is actually Vercel calling
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized - Invalid Cron Secret', { status: 401 });
    }

    try {
        // 2. In the single-tenant model there is only one agency.
        //    Check that it is on the PRO plan before running.
        const tenant = await prisma.tenant.findFirst({
            select: { companyName: true, planTier: true, contactEmail: true, adminEmail: true }
        });

        if (!tenant || tenant.planTier !== 'PRO') {
            return NextResponse.json({ success: true, message: "No PRO account to backup." });
        }

        console.log(`Processing backup for: ${tenant.companyName}`);

        // 3. Generate the single 'AUTOMATIC' backup
        await createBackup('AUTOMATIC');

        // 4. Send the notification email
        try {
            const notifyEmail = tenant.contactEmail || tenant.adminEmail;
            if (process.env.RESEND_API_KEY && notifyEmail) {
                await resend.emails.send({
                    from: 'Travelo CRM <noreply@yourdomain.com>',
                    to: [notifyEmail],
                    subject: '✅ Your Monthly Backup is Ready',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #2563EB;">Backup Successful</h2>
                            <p>Hi there,</p>
                            <p>Your automated monthly backup for <strong>${tenant.companyName}</strong> has been successfully created and securely stored.</p>
                            <p>You can view and download this backup anytime from your Admin Dashboard under the <strong>Backups</strong> tab.</p>
                            <br/>
                            <p style="font-size: 12px; color: #888;">Thank you for using Travelo CRM (PRO Tier).</p>
                        </div>
                    `
                });
                console.log(`Email sent for ${tenant.companyName}`);
            }
        } catch (emailError) {
            console.error(`Failed to send backup email:`, emailError);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully backed up ${tenant.companyName}.`
        });

    } catch (error: any) {
        console.error("Cron Backup Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}