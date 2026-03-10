// app/admin/leads/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });
    
    // Refresh the leads page so the new status reflects immediately
    revalidatePath('/admin/leads'); 
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update status");
  }
}