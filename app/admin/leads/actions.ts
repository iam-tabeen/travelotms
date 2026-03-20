// app/admin/leads/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    // 1. Fetch the existing booking FIRST so we know exactly what is changing
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { status: true, numTravelers: true, tourId: true, isWaitlist: true }
    });

    if (!existingBooking) throw new Error("Booking not found");

    // 2. Update the booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    // 3. --- THE FIX: HANDLE THE CAPACITY MATH ---
    // Only touch the tour capacity if this was NOT a waitlist request
    if (!existingBooking.isWaitlist && existingBooking.tourId) {
      
        // Scenario A: They are cancelling an active booking -> Free up the spots!
        if (newStatus === 'CANCELLED' && existingBooking.status !== 'CANCELLED') {
            await prisma.tour.update({
                where: { id: existingBooking.tourId },
                data: {
                    bookedSpots: {
                        decrement: existingBooking.numTravelers
                    }
                }
            });
        }
        
        // Scenario B: They are un-cancelling a booking (e.g., changing back to CONFIRMED) -> Take the spots back!
        else if (existingBooking.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
            await prisma.tour.update({
                where: { id: existingBooking.tourId },
                data: {
                    bookedSpots: {
                        increment: existingBooking.numTravelers
                    }
                }
            });
        }
    }
    
    // Refresh the leads page so the new status reflects immediately
    revalidatePath('/admin/leads'); 
    
    // NEW: Refresh the dashboard too, so the capacity progress bar updates instantly!
    revalidatePath('/admin'); 

  } catch (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update status");
  }
}