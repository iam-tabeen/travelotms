'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

// 1. Security Check (No PIN needed, the page login protects us!)
async function checkSuperAdmin() {
    const { userId } = await auth();
    if (!userId || userId !== process.env.SUPER_ADMIN_ID) {
        throw new Error("Unauthorized action.");
    }
}

// 2. The Kill Switch Action (Removed masterPin argument)
export async function toggleAgencyAccess(tenantId: string, currentStatus: boolean) {
    try {
        await checkSuperAdmin();
        
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { isActive: !currentStatus }
        });
        
        revalidatePath('/super-admin'); 
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update access." };
    }
}

// 3. The Upgrade Plan Action
export async function updateAgencyTier(tenantId: string, newTier: string) {
    try {
        await checkSuperAdmin();
        
        await prisma.tenant.update({
            where: { id: tenantId },
            // "as any" prevents Prisma from crashing if your schema uses a strict Enum for planTier
            data: { planTier: newTier as any } 
        });
        
        revalidatePath('/super-admin');
        return { success: true };
    } catch (error) {
        console.error("Update Tier Error:", error);
        return { success: false, error: "Failed to update agency tier." };
    }
}

export async function unlockSuperAdminDashboard(username: string, pass: string) {
    if (
        username === process.env.SUPER_ADMIN_USERNAME && 
        pass === process.env.SUPER_ADMIN_PASSWORD
    ) {
        // Set a secure cookie that expires in 2 hours
        const cookieStore = await cookies();
        cookieStore.set('super_admin_unlocked', 'true', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 2 // 2 hours
        });
        return { success: true };
    }
    return { success: false, error: "Invalid username or password" };
}