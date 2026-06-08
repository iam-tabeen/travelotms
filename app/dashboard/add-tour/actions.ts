"use server";

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { revalidateDashboard, revalidateTours } from '@/lib/cache-helpers';

// --- HYPER-SAFE DATA SANITIZATION HELPERS ---
function safeFloat(val: any) {
  if (!val) return 0;
  const parsed = parseFloat(val.toString());
  return isNaN(parsed) ? 0 : parsed;
}

function safeInt(val: any) {
  if (!val || val.toString().trim() === '') return undefined; 
  const parsed = parseInt(val.toString(), 10);
  return isNaN(parsed) ? undefined : parsed; 
}

function safeDate(val: any) {
  if (!val || val.toString().trim() === '') return undefined; 
  const parsed = new Date(val.toString());
  return isNaN(parsed.getTime()) ? undefined : parsed; 
}

function safeJsonParse(val: any) {
  try {
    return JSON.parse(val.toString() || '[]');
  } catch (e) {
    return [];
  }
}

// ---------------------------------------------

export async function createTour(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Agency settings not found');

  const title = (formData.get('title') as string) || 'Untitled Tour';
  const destination = (formData.get('destination') as string) || 'Unknown';
  const duration = (formData.get('duration') as string) || '';
  const transportType = (formData.get('transportType') as string) || 'Car';
  const accommodation = (formData.get('accommodation') as string) || '';
  const bookingMode = (formData.get('bookingMode') as string) || 'BOTH';
  const status = (formData.get('status') as string) || 'ACTIVE';
  
  const overview = (formData.get('overview') as string) || '';
  const policy = (formData.get('policy') as string) || '';
  
  const rawInclusions = formData.get('inclusions') as string || '';
  const inclusions = rawInclusions.split('\n').filter(i => i.trim() !== '');
  
  const rawExclusions = formData.get('exclusions') as string || '';
  const exclusions = rawExclusions.split('\n').filter(i => i.trim() !== '');
  
  const coverImage = (formData.get('coverImage') as string) || '';
  const departureType = (formData.get('departureType') as string) || 'CLIENT_CHOICE';
  const departureEveryYear = formData.get('departureEveryYear') === 'true';
  const blockedDates = (formData.get('blockedDates') as string) || "[]";

  const addOns = formData.get('addOns') as string || "[]";

  const basePrice = safeFloat(formData.get('basePrice'));
  const maxCapacity = safeInt(formData.get('maxCapacity'));
  const departureDate = safeDate(formData.get('departureDate'));
  const gallery = safeJsonParse(formData.get('gallery'));
  
  // Clean the itinerary data so Prisma's relation engine accepts it
  const rawItinerary = safeJsonParse(formData.get('itinerary'));
  const cleanItinerary = rawItinerary.map((day: any) => ({
    dayNumber: parseInt(day.dayNumber, 10) || 1,
    title: day.title || '',
    details: day.details || ''
  }));

  await prisma.tour.create({
    data: {
      title,
      destination,
      basePrice,
      duration,
      transportType,
      accommodation,
      bookingMode,
      status,
      overview,
      policy,
      inclusions,
      exclusions,
      coverImage,
      gallery,
      departureType,
      departureDate,
      departureEveryYear,
      maxCapacity,
      blockedDates,
      addOns,
      itineraryDays: {
        create: cleanItinerary
      }
    }
  });

  await revalidateTours();
  await revalidateDashboard();

  // THE FIX: Added the ?success parameter to trigger the Toast!
  redirect('/dashboard/tours?success=Tour_Added_Successfully!');
}

export async function updateTour(tourId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const title = (formData.get('title') as string) || 'Untitled Tour';
  const destination = (formData.get('destination') as string) || 'Unknown';
  const duration = (formData.get('duration') as string) || '';
  const transportType = (formData.get('transportType') as string) || 'Car';
  const accommodation = (formData.get('accommodation') as string) || '';
  const bookingMode = (formData.get('bookingMode') as string) || 'BOTH';
  const status = (formData.get('status') as string) || 'ACTIVE';

  const overview = (formData.get('overview') as string) || '';
  const policy = (formData.get('policy') as string) || '';
  
  const rawInclusions = formData.get('inclusions') as string || '';
  const inclusions = rawInclusions.split('\n').filter(i => i.trim() !== '');
  
  const rawExclusions = formData.get('exclusions') as string || '';
  const exclusions = rawExclusions.split('\n').filter(i => i.trim() !== '');

  const coverImage = (formData.get('coverImage') as string) || '';
  const departureType = (formData.get('departureType') as string) || 'CLIENT_CHOICE';
  const departureEveryYear = formData.get('departureEveryYear') === 'true';
  const blockedDates = (formData.get('blockedDates') as string) || "[]";

  const addOns = formData.get('addOns') as string || "[]";

  const basePrice = safeFloat(formData.get('basePrice'));
  const maxCapacity = safeInt(formData.get('maxCapacity'));
  const departureDate = safeDate(formData.get('departureDate'));
  const gallery = safeJsonParse(formData.get('gallery'));
  
  // Clean the itinerary data
  const rawItinerary = safeJsonParse(formData.get('itinerary'));
  const cleanItinerary = rawItinerary.map((day: any) => ({
    dayNumber: parseInt(day.dayNumber, 10) || 1,
    title: day.title || '',
    details: day.details || ''
  }));

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      title,
      destination,
      basePrice,
      duration,
      transportType,
      accommodation,
      bookingMode,
      status,
      overview,
      policy,
      inclusions,
      exclusions,
      coverImage,
      gallery,
      departureType,
      departureDate,
      departureEveryYear,
      maxCapacity,
      blockedDates,
      addOns,
      itineraryDays: {
        deleteMany: {}, 
        create: cleanItinerary
      }
    }
  });

  await revalidateTours();
  await revalidateDashboard();

  // THE FIX: Added the ?success parameter to trigger the Toast!
  redirect('/dashboard/tours?success=Tour_Updated_Successfully!');
}

export async function deleteTour(tourId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.tour.delete({
    where: { id: tourId },
  });

  await revalidateTours();
  await revalidateDashboard();

  // THE FIX: Redirects back to the same page but injects the success message
  redirect('/dashboard/tours?success=Tour_Deleted_Successfully');
}

export async function quickUpdateBookingMode(tourId: string, bookingMode: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.tour.update({
    where: { id: tourId },
    data: { bookingMode },
  });

  revalidatePath('/dashboard/tours');
  await revalidateTours();
  await revalidateDashboard();
  // THE FIX: Return a success object so the client dropdown component can fire a toast directly!
  return { success: true };
}