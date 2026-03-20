import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TourClient from './TourClient';
import React from 'react';

// Import your Navbar and Footer
import Navbar from '@/components/lovable/Navbar'; 
import Footer from '@/components/lovable/Footer'; 

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TourDetail({ params }: Props) {
  const { id } = await params;

  // 1. Fetch the tour AND the specific tenant that owns it in ONE query!
  const tour = await prisma.tour.findUnique({
    where: { 
      id: id,
      status: 'ACTIVE' 
    },
    include: {
      itineraryDays: {
        orderBy: { dayNumber: 'asc' } 
      },
      tenant: true // <--- THIS FIXES THE MULTI-TENANCY BUG!
    }
  });

  // If the tour doesn't exist, or it has no owner, show 404
  if (!tour || !tour.tenant) {
    notFound();
  }

  // Extract the specific tenant that owns this tour
  const tenant = tour.tenant;

  const globalTheme = {
    // 1. Your existing dynamic theme variables
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827', 
    '--theme-card': tenant.cardColor || '#111827', 
    '--navlink': tenant.navlink || '#111827', 

    // 2. Force the TourClient template classes to use your database colors!
    '--axius-primary': tenant.primaryColor || '#003580',
    '--axius-secondary': tenant.headingColor || '#1F2937',
  } as React.CSSProperties;

  // --- Calculate the correct fixed date string to pass to the form ---
  let calculatedFixedDate: string | undefined = undefined;
  
  if (tour.departureType === 'CUSTOM_DATE' && tour.departureDate) {
    const d = new Date(tour.departureDate);
    
    if (tour.departureEveryYear) {
      const today = new Date();
      let targetDate = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      
      // Roll over to next year if the date has already passed
      if (targetDate < today) {
        targetDate.setFullYear(today.getFullYear() + 1);
      }
      calculatedFixedDate = targetDate.toISOString().split('T')[0]; // Creates "YYYY-MM-DD"
    } else {
      calculatedFixedDate = d.toISOString().split('T')[0];
    }
  }

  // 3. The globalTheme div now wraps EVERYTHING so Navbar gets the colors too
  return (
    <div style={globalTheme}> 
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />

      <div className="bg-gray-50 pt-20"> 
        <TourClient 
          tour={tour} 
          fixedDate={calculatedFixedDate} 
          // THE FIX: We pass the exact tenant's plan tier down to the Client Component
          isPro={tenant.planTier === 'PRO'} 
        />
      </div>

      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </div>
  );
}