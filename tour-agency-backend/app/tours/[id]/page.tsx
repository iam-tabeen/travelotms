

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

  const tenant = await prisma.tenant.findFirst({
    include: {
      tours: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tenant) return null;

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

    // 2. THE FIX: Force the TourClient template classes to use your database colors!
    '--axius-primary': tenant.primaryColor || '#003580',
    '--axius-secondary': tenant.headingColor || '#1F2937',
  } as React.CSSProperties;

  // Fetch the tour data
  const tour = await prisma.tour.findUnique({
    where: { 
      id: id,
      status: 'ACTIVE' 
    },
    include: {
      itineraryDays: {
        orderBy: { dayNumber: 'asc' } 
      }
    }
  });

  if (!tour) {
    notFound();
  }

  // 3. THE WRAPPER FIX: The globalTheme div now wraps EVERYTHING so Navbar gets the colors too
  return (
    <div style={globalTheme}> 
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />

      <div className="bg-gray-50 pt-20"> 
        <TourClient tour={tour} />
      </div>

      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </div>
  );
}