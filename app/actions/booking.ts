"use server";

import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer'; // <-- 1. Import Nodemailer

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

  // 2. Save to database (Your original code!)
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
      status: "PENDING"
    }
  });

  // 3. --- NEW: Fire off the Email Notification ---
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      // For now, send it to yourself. Later, we can change this to the Tenant's email!
      to: "iamtabeenhaider@gmail.com", 
      subject: `🎉 New Tour Lead: ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #E5E9F2; border-radius: 16px; background-color: #FAFAFA;">
          <h2 style="color: #003580; margin-top: 0;">New Booking Request</h2>
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #E5E9F2;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${customerPhone}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
            <p style="margin: 8px 0;"><strong>Travelers:</strong> ${numTravelers}</p>
            <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${travelDateString}</p>
            <p style="margin: 8px 0;"><strong>Total Value:</strong> Rs. ${totalPrice.toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Notes:</strong> ${specialNotes || 'None'}</p>
          </div>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads?tab=regular" style="background-color: #003580; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Lead in Dashboard</a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // If email fails, don't crash the app. The DB save already worked!
    console.error("Email failed to send, but booking was saved to DB:", error);
  }

  // You can return a success object to trigger a UI update on the frontend
  return { success: true };
}