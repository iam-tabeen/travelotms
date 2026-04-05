"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Yeh function dashboard mein dropdown se status (Pending, Contacted etc) change karne ke kaam aata hai
export async function updateCustomLeadStatus(leadId: string, newStatus: string) {
    try {
      await prisma.customTourLead.update({
        where: { id: leadId },
        data: { status: newStatus }
      });
      
      // Refresh the leads page so the UI updates instantly
      revalidatePath('/dashboard/leads');
      return { success: true };
    } catch (error) {
      console.error("Failed to update custom lead status:", error);
      return { success: false, error: "Failed to update status" };
    }
}