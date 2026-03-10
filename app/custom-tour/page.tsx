import prisma from '@/lib/prisma';
import Navbar from '@/components/lovable/Navbar';
import Footer from '@/components/lovable/Footer';
import CustomTourForm from '@/components/CustomTourForm';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function CustomTourPage() {
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) return null;

  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827',
    '--theme-card': tenant.cardColor || '#111827',
    '--navlink': tenant.navlink || '#ffffff',
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-gray-50" style={globalTheme}>
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white py-24 border-b border-gray-100" style={{ backgroundColor: 'var(--theme-primary)' }}>
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("https://res.cloudinary.com/dmjgwmkuy/image/upload/v1772801682/mountains-bg-2_ht6rhu.png")', 
            backgroundSize: '1920px',
            backgroundPositionY: '150px',
            opacity: 0.1,
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--theme-heading)' }}>
            Design Your Dream
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-6 text-white" >
            Customize Your Trip
          </h1>
          <p className="text-white max-w-2xl mx-auto text-lg leading-relaxed">
            Can't find the perfect pre-made package? Let our experts craft a bespoke itinerary tailored entirely to your schedule, budget, and travel style.
          </p>
        </div>
      </div>
      <div className="or-spacer">
        <div className="mask"></div>
      </div>

      {/* Main Form Container */}
      <div className="py-20 px-4 sm:px-6">
      <CustomTourForm tenantId={tenant.id} />
      </div>

      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>

      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}