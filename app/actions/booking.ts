"use server";

import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function submitBooking(
  tourId: string, 
  tenantId: string, 
  basePrice: number, 
  formData: FormData
) {
  const isWaitlist = formData.get('isWaitlist') === 'true';
  const travelersRaw = formData.get('numTravelers');
  
  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const travelDateString = formData.get('travelDate') as string;
  const numTravelers = travelersRaw ? parseInt(travelersRaw.toString()) : 1;
  const specialNotes = formData.get('specialNotes') as string;
  
  // NEW: Extract selected Add-ons string
  const selectedAddOns = formData.get('selectedAddOns') as string;

  const finalPriceRaw = formData.get('finalPrice');
  const promoCodeId = formData.get('promoCodeId') as string | null;
  const totalPrice = finalPriceRaw ? parseFloat(finalPriceRaw as string) : (basePrice * numTravelers);
  const travelDate = new Date(travelDateString);

  if (!isWaitlist) {
    await prisma.tour.update({
      where: { id: tourId },
      data: { bookedSpots: { increment: numTravelers } }
    });
  }

  try {
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
        status: "PENDING",
        isWaitlist: isWaitlist,
        selectedAddOns: selectedAddOns || null // <-- SAVE TO DB
      }
    });

    if (promoCodeId) {
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: { timesUsed: { increment: 1 } }
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "iamtabeenhaider@gmail.com", 
      subject: `🎉 New Tour Lead: ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E9F2; border-radius: 16px; background-color: #FAFAFA;">
          <h2 style="color: #003580; margin-top: 0;">New Booking Request</h2>
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #E5E9F2;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin: 8px 0;"><strong>Travelers:</strong> ${numTravelers}</p>
            <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${travelDateString}</p>
            
            <p style="margin: 8px 0;"><strong>Selected Extras:</strong> 
              <span style="color: #2563EB; font-weight: bold;">${selectedAddOns || 'None'}</span>
            </p>

            <p style="margin: 8px 0; font-size: 18px; color: #10B981;"><strong>Total Value:</strong> Rs. ${totalPrice.toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Notes:</strong> ${specialNotes || 'None'}</p>
          </div>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads" style="background-color: #003580; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Lead</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (error) {
    console.error("Booking process failed:", error);
    throw new Error("Failed to process booking");
  }
}