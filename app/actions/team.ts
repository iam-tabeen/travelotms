"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server'; // <-- Clerk's secret weapon
import { revalidateTeam } from '@/lib/cache-helpers';

export async function inviteTeamMember(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !role || !password) {
        return { error: "Missing required fields" };
    }

    try {
        // 1. Check if the user already exists in this workspace
        const existingMember = await prisma.teamMember.findFirst({
            where: { email }
        });

        if (existingMember) {
            return { error: "This user is already in your workspace." };
        }

        // 2. Silently create the user in Clerk so they can log in
        try {
            const client = await clerkClient();
            await client.users.createUser({
                emailAddress: [email],
                password: password,
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1] || '',
                // Skip the email verification requirement so they can log in instantly
                skipPasswordChecks: true, 
            });
        } catch (clerkError: any) {
            console.error("Clerk creation failed:", clerkError);
            // Clerk usually throws an error if the email is already registered globally
            return { error: "Could not create user. The email might already be registered." };
        }

        // 3. Create the team member in YOUR database as ACTIVE immediately!
        await prisma.teamMember.create({
            data: {
                name,
                email,
                role,
                status: 'ACTIVE'
            }
        });

        // 4. Refresh the team page
        revalidatePath('/dashboard/team');
        await revalidateTeam();
        return { success: true };

    } catch (error) {
        console.error("Failed to add team member:", error);
        return { error: "Something went wrong. Please try again." };
    }
}

// Add this to the BOTTOM of app/actions/team.ts

export async function updateTeamMemberRole(memberId: string, newRole: 'AGENT' | 'VIEWER') {
    try {
        await prisma.teamMember.update({
            where: { id: memberId },
            data: { role: newRole }
        });
        revalidatePath('/dashboard/team');
        await revalidateTeam();
        return { success: true };
    } catch (error) {
        console.error("Failed to update role:", error);
        return { error: "Failed to update role" };
    }
}

export async function removeTeamMember(memberId: string) {
    try {
        await prisma.teamMember.delete({
            where: { id: memberId }
        });
        revalidatePath('/dashboard/team');
        await revalidateTeam();
        return { success: true };
    } catch (error) {
        console.error("Failed to remove member:", error);
        return { error: "Failed to remove member" };
    }
}