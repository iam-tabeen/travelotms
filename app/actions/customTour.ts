"use server";

import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma'; // <-- Import Prisma
import { revalidatePath } from 'next/cache';

export async function submitCustomTour(tenantId: string, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const cityCountry = formData.get('cityCountry') as string;
  
  const dateFrom = formData.get('dateFrom') as string;
  const dateTo = formData.get('dateTo') as string;
  const travelers = formData.get('travelers') as string;
  const accommodation = formData.get('accommodation') as string;
  const budget = formData.get('budget') as string;
  const requirements = formData.get('requirements') as string;

  const destinations = formData.getAll('destinations') as string[];
  const tourTypes = formData.getAll('tourTypes') as string[];

  // 1. Save to Database
  await prisma.customTourLead.create({
    data: {
      tenantId,
      fullName,
      email,
      phone,
      cityCountry,
      dateFrom,
      dateTo,
      travelers,
      accommodation,
      budget,
      destinations: destinations.join(', '), // Convert array to string
      tourTypes: tourTypes.join(', '),       // Convert array to string
      requirements,
      status: "PENDING"
    }
  });

  // 2. Send Email Notification
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
      to: "iamtabeenhaider@gmail.com", 
      replyTo: email, 
      subject: `✨ New Custom Tour Request: ${fullName}`,
      html: `
        <h2 style="color: #003580;">Custom Trip Inquiry</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Dates:</strong> ${dateFrom} to ${dateTo}</p>
        <p><strong>Travelers:</strong> ${travelers}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Destinations:</strong> ${destinations.join(', ')}</p>
        <br/>
        <a href="http://localhost:3000/admin/leads?tab=custom" style="background-color: #003580; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View Lead in Dashboard</a>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Custom tour email failed:", error);
  }
  
  return { success: true };
}

export async function updateCustomLeadStatus(leadId: string, newStatus: string) {
    try {
      await prisma.customTourLead.update({
        where: { id: leadId },
        data: { status: newStatus }
      });
      
      // Refresh the leads page so the UI updates instantly
      revalidatePath('/admin/leads');
      return { success: true };
    } catch (error) {
      console.error("Failed to update custom lead status:", error);
      return { success: false, error: "Failed to update status" };
    }
  }