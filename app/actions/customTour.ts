"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { revalidateDashboard } from '@/lib/cache-helpers';

export async function updateCustomLeadStatus(leadId: string, newStatus: string) {
    try {
      await prisma.customTourLead.update({
        where: { id: leadId },
        data: { status: newStatus }
      });
      revalidatePath('/dashboard/leads');
            await revalidateDashboard();
      return { success: true };
    } catch (error) {
      console.error("Failed to update custom lead status:", error);
      return { success: false, error: "Failed to update status" };
    }
}

export async function submitCustomTour(formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const cityCountry = formData.get('cityCountry') as string || '';
    const dateFrom = formData.get('dateFrom') as string || '';
    const dateTo = formData.get('dateTo') as string || '';
    const travelers = formData.get('travelers') as string || '1';
    const accommodation = formData.get('accommodation') as string || '';
    const budget = formData.get('budget') as string || '';
    const destinations = (formData.getAll('destinations') as string[]).join(', ') || (formData.get('destinations') as string) || '';
    const tourTypes = (formData.getAll('tourTypes') as string[]).join(', ') || (formData.get('tourTypes') as string) || '';
    const requirements = formData.get('requirements') as string || '';

    if (!fullName || !email || !phone) {
        return { success: false, error: "Name, email, and phone are required." };
    }

    try {
        await prisma.customTourLead.create({
            data: {
                fullName,
                email,
                phone,
                cityCountry,
                dateFrom,
                dateTo,
                travelers,
                accommodation,
                budget,
                destinations,
                tourTypes,
                requirements,
                status: 'PENDING'
            }
        });
        revalidatePath('/dashboard/leads');
        await revalidateDashboard();
        return { success: true };
    } catch (error) {
        console.error("Failed to submit custom tour request:", error);
        return { success: false, error: "Failed to submit your request." };
    }
}