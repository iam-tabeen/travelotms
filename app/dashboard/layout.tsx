import React from 'react';
import { redirect } from 'next/navigation';

// 1. IMPORT YOUR COMPONENTS & NEW HELPER
import AdminSidebar from '@/components/dashboardSidebar'; 
import { getUserAccess } from '@/lib/getTenant';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  
  // 1. Fetch the access object containing the tenant and the user's role
  const access = await getUserAccess();
  
  // 2. If they are completely unauthorized, send to onboarding
  if (!access) {
      redirect('/onboarding'); // Replace with your actual setup/onboarding route if different
  }

  // Extract the specific tenant and role from our helper
  const { tenant, role } = access;

  // --- THE MASTER LOCK CHECK ---
  // If the agency exists but is marked inactive/suspended, kick them out immediately
  if (tenant.isActive === false) {
    redirect('/suspended');
  }
  // ----------------------------------

  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827',
    '--theme-card': tenant.cardColor || '#111827',
    '--navlink': tenant.navlink || '#111827',
    '--axius-primary': tenant.primaryColor || '#003580',
    '--axius-secondary': tenant.headingColor || '#1F2937',
  } as React.CSSProperties;

  return (
    <main style={{ ...globalTheme, fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F4F7F9]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        
        /* Smooth scrollbar for the new sidebar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 4px; }
      `}</style>

      {/* --- THE NEW FLEXBOX LAYOUT --- */}
      <div className="flex min-h-screen">
        
        {/* 1. PASS THE ROLE PROP TO THE SIDEBAR! */}
        <AdminSidebar role={role} />

        {/* 2. The Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          
          {/* Mobile top spacer so content isn't hidden behind the floating hamburger menu */}
          <>
  <style>{`
    /* Force the dark background when the HTML tag has the .dark class */
    html.dark .mobile-top-bar {
      background-color: #0F172A !important;
    }
  `}</style>

  <div className="md:hidden h-16 bg-[#F4F7F9] shrink-0 transition-colors duration-300 mobile-top-bar"></div>
</>
          
          {children}
          
        </div>

      </div>
    </main>
  );
}