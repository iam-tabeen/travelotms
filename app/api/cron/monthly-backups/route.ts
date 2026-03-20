import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createBackup } from '@/app/actions/backup-actions';

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
            select: { id: true, companyName: true }
        });

        console.log(`Found ${proTenants.length} PRO tenants. Starting automated backups...`);

        // 3. Loop through them and generate an 'AUTOMATIC' backup
        for (const tenant of proTenants) {
            console.log(`Processing backup for: ${tenant.companyName}`);
            await createBackup(tenant.id, 'AUTOMATIC');
            
            // TODO: In the future, we can trigger an email here saying "Your monthly backup is ready!"
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