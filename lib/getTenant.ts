// Use this (NO curly braces):
import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

// Keeps your existing pages working perfectly
export async function getTenantForUser() {
    const access = await getUserAccess();
    return access?.tenant || null;
}

// NEW: Fetches the tenant AND their specific role!
export async function getUserAccess() {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) return null;

    // 1. Check if Owner
    let tenant = await prisma.tenant.findUnique({
        where: { userId }
    });

    if (tenant) {
        return { tenant, role: 'OWNER' };
    }

    // 2. Check if Team Member
    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    if (primaryEmail) {
        const teamMember = await prisma.teamMember.findFirst({
            where: { email: primaryEmail },
            include: { tenant: true }
        });

        if (teamMember && teamMember.tenant) {
            return { tenant: teamMember.tenant, role: teamMember.role }; // 'ADMIN', 'AGENT', or 'VIEWER'
        }
    }

    return null;
}