"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export async function createTour(formData: FormData) {
  // 1. Secure the route and get the unique Clerk User ID
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in to create a tour");

  // Extract all standard fields
  const title = formData.get('title') as string;
  const destination = formData.get('destination') as string;
  const basePrice = parseInt(formData.get('basePrice') as string);
  const status = formData.get('status') as string || 'ACTIVE';
  
  const duration = formData.get('duration') as string;
  const transportType = formData.get('transportType') as string;
  const accommodation = formData.get('accommodation') as string;
  const bookingMode = formData.get('bookingMode') as string || 'BOTH';
  
  const uploadedImage = formData.get('coverImage') as string;
  const coverImage = uploadedImage ? uploadedImage : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop';

  const itineraryString = formData.get('itinerary') as string;
  const itineraryDays = itineraryString ? JSON.parse(itineraryString) : [];

  // --- Extract Redesign Fields ---
  const overview = formData.get('overview') as string || null;
  const policy = formData.get('policy') as string || null;
  
  const galleryString = formData.get('gallery') as string;
  const gallery = galleryString ? JSON.parse(galleryString) : [];

  // Convert text area lists (separated by new lines) into actual arrays
  const inclusionsString = formData.get('inclusions') as string;
  const inclusions = inclusionsString ? inclusionsString.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const exclusionsString = formData.get('exclusions') as string;
  const exclusions = exclusionsString ? exclusionsString.split('\n').map(s => s.trim()).filter(Boolean) : [];

  // --- THE FIX: Extract the Departure Fields for CREATE ---
  const departureType = formData.get('departureType') as string || 'CLIENT_CHOICE';
  const departureDateStr = formData.get('departureDate') as string;
  const departureEveryYear = formData.get('departureEveryYear') === 'true'; // Checkbox boolean
  const departureDate = departureDateStr ? new Date(departureDateStr) : null;

  // 2. Find the user's specific agency, or create a new one if it's their first time
  let tenant = await prisma.tenant.findUnique({
    where: { userId: userId }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { 
        userId: userId,
        companyName: "My Travel Agency",
        subdomain: `agency-${Date.now()}`,
        adminEmail: "admin@example.com"
      }
    });
  }

  // 3. Create the tour and attach it ONLY to their specific Tenant ID
  await prisma.tour.create({
    data: {
      tenantId: tenant.id,
      title,
      destination,
      basePrice,
      status,
      duration,
      transportType,
      accommodation,
      bookingMode,
      coverImage,
      
      // Inject Departure Fields
      departureType: departureType,
      departureDate: departureDate,
      departureEveryYear: departureEveryYear,
      
      // Inject new fields here
      overview,
      policy,
      gallery,
      inclusions,
      exclusions,

      itineraryDays: {
        create: itineraryDays.map((day: any) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          details: day.details
        }))
      }
    }
  });

  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateTour(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const destination = formData.get('destination') as string;
  const basePrice = parseInt(formData.get('basePrice') as string);
  const status = formData.get('status') as string;
  
  const duration = formData.get('duration') as string;
  const transportType = formData.get('transportType') as string;
  const accommodation = formData.get('accommodation') as string;
  const bookingMode = formData.get('bookingMode') as string || 'BOTH';
  const coverImage = formData.get('coverImage') as string;

  const itineraryString = formData.get('itinerary') as string;
  const itineraryDays = itineraryString ? JSON.parse(itineraryString) : [];

  // --- Extract Redesign Fields for Updates ---
  const overview = formData.get('overview') as string || null;
  const policy = formData.get('policy') as string || null;
  
  const galleryString = formData.get('gallery') as string;
  const gallery = galleryString ? JSON.parse(galleryString) : [];

  const inclusionsString = formData.get('inclusions') as string;
  const inclusions = inclusionsString ? inclusionsString.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const exclusionsString = formData.get('exclusions') as string;
  const exclusions = exclusionsString ? exclusionsString.split('\n').map(s => s.trim()).filter(Boolean) : [];

  // --- Extract the Departure Fields for UPDATE ---
  const departureType = formData.get('departureType') as string || 'CLIENT_CHOICE';
  const departureDateStr = formData.get('departureDate') as string;
  const departureEveryYear = formData.get('departureEveryYear') === 'true'; // Checkbox boolean
  const departureDate = departureDateStr ? new Date(departureDateStr) : null;

  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.tour.update({
        where: { id },
        data: {
          title,
          destination,
          basePrice,
          status,
          duration,
          transportType,
          accommodation,
          bookingMode,
          
          // THE FIX: Inject updated departure fields
          departureType: departureType,
          departureDate: departureDate,
          departureEveryYear: departureEveryYear,
          
          // Inject updated fields
          overview,
          policy,
          ...(gallery.length > 0 && { gallery }), // Only update if new images are uploaded
          inclusions,
          exclusions,

          // Only update the cover image if a new one was actually provided
          ...(coverImage && { coverImage }), 
        }
      });

      await tx.itineraryDay.deleteMany({
        where: { tourId: id }
      });

      if (itineraryDays.length > 0) {
        await tx.tour.update({
          where: { id },
          data: {
            itineraryDays: {
              create: itineraryDays.map((day: any) => ({
                dayNumber: day.dayNumber,
                title: day.title,
                details: day.details
              }))
            }
          }
        });
      }
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    throw new Error("Failed to update tour");
  }

  revalidatePath('/admin');
  redirect('/admin');
}

export async function deleteTour(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.itineraryDay.deleteMany({
    where: { tourId: id }
  });
  await prisma.tour.delete({
    where: { id }
  });
  revalidatePath('/admin');
}

export async function quickUpdateBookingMode(tourId: string, newMode: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.tour.update({
    where: { id: tourId },
    data: { bookingMode: newMode },
  });
  revalidatePath('/admin'); 
}