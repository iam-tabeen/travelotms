import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

// Convenience wrapper kept for backwards compatibility with existing pages.
export async function getTenantForUser() {
    const access = await getUserAccess();
    return access?.tenant || null;
}

/**
 * Single-tenant version of getUserAccess.
 *
 * Role resolution order:
 *  1. If the authenticated Clerk userId matches the `userId` stored on the
 *     singleton Tenant settings row → OWNER.
 *  2. If the authenticated user's primary email matches an ACTIVE TeamMember
 *     row → that member's role (ADMIN | AGENT | VIEWER).
 *  3. Otherwise → null (unauthenticated / unauthorized).
 *
 * The `tenant` object returned is the single agency-settings row and is
 * used throughout the dashboard for branding, plan-tier checks, etc.
 */
export async function getUserAccess() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return null;

    // Fetch the single settings row that always exists in this deployment.
    const tenant = await prisma.tenant.findFirst();

    // Database hasn't been seeded / settings saved yet.
    if (!tenant) return null;

    // If tenant exists but owner is not assigned yet, force onboarding claim flow.
    if (!tenant.userId) return null;

    // 1. Check ownership via the stored Clerk user ID.
    if (tenant.userId === userId) {
        return { tenant, role: 'OWNER' as const };
    }

    // 2. Check team-member access via email.
    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    if (primaryEmail) {
        const teamMember = await prisma.teamMember.findFirst({
            where: { email: primaryEmail, status: 'ACTIVE' },
        });

        if (teamMember) {
            return { tenant, role: teamMember.role as 'ADMIN' | 'AGENT' | 'VIEWER' };
        }
    }

    return null;
}