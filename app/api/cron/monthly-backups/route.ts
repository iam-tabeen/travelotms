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
        // 2. Find ALL agencies that are paying for the PRO tier
        const proTenants = await prisma.tenant.findMany({
            where: { planTier: 'PRO' },
            select: { 
                id: true, 
                companyName: true,
                // Add the tenant's email here if you have it in this model!
                // email: true 
            }
        });

        console.log(`Found ${proTenants.length} PRO tenants. Starting automated backups...`);

        // 3. Loop through them and generate an 'AUTOMATIC' backup
        for (const tenant of proTenants) {
            console.log(`Processing backup for: ${tenant.companyName}`);
            
            // Generate the backup
            await createBackup(tenant.id, 'AUTOMATIC');
            
            // ✅ Send the notification email
            // Wrapped in a try/catch so if one email fails, it doesn't stop the rest of the backups!
            try {
                // Ensure you only try to send if you aren't using the dummy key during a build
                if (process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'Travelo CRM <noreply@yourdomain.com>', // Update with your verified Resend domain
                        to: ['agency-owner@example.com'], // Update with tenant.email
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
                console.error(`Failed to send email to ${tenant.companyName}:`, emailError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully backed up ${proTenants.length} PRO accounts.` 
        });

    } catch (error: any) {
        console.error("Cron Backup Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}