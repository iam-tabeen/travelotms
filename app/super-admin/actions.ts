'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

// 1. Security Check: Ensure only YOU can run these actions
async function checkSuperAdmin() {
    const { userId } = await auth();
    if (!userId || userId !== process.env.SUPER_ADMIN_ID) {
        throw new Error("Unauthorized action.");
    }
}

// 2. The Kill Switch Action
export async function toggleAgencyAccess(tenantId: string, currentStatus: boolean) {
    await checkSuperAdmin();
    
    await prisma.tenant.update({
        where: { id: tenantId },
        data: { isActive: !currentStatus }
    });
    
    revalidatePath('/super-admin'); // Refreshes the page instantly
}

// 3. The Upgrade Plan Action
export async function updateAgencyTier(tenantId: string, newTier: string) {
    await checkSuperAdmin();
    
    await prisma.tenant.update({
        where: { id: tenantId },
        data: { planTier: newTier }
    });
    
    revalidatePath('/super-admin');
}