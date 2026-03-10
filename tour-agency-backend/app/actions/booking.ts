"use server";

import prisma from '@/lib/prisma';

export async function submitBooking(
  tourId: string, 
  tenantId: string, 
  basePrice: number, 
  formData: FormData
) {
  // Extract data from the form
  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const travelDateString = formData.get('travelDate') as string;
  const numTravelers = parseInt(formData.get('numTravelers') as string) || 1;
  const specialNotes = formData.get('specialNotes') as string;

  // Calculate total price and parse the date
  const totalPrice = basePrice * numTravelers;
  const travelDate = new Date(travelDateString);

  // Save to database
  await prisma.booking.create({
    data: {
      tenantId,
      tourId,
      customerName,
      customerEmail,
      customerPhone,
      numTravelers,
      totalPrice,
      travelDate,
      specialNotes,
      status: "PENDING" // Default status for new leads
    }
  });

  // You can return a success object to trigger a UI update on the frontend
  return { success: true };
}
