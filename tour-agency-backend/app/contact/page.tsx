import prisma from '@/lib/prisma';
import Navbar from '@/components/lovable/Navbar';
import Footer from '@/components/lovable/Footer';
import React from 'react';

// THE FIX: Force this page to always fetch fresh data from the DB
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  // 1. Fetch the tenant data to get the branding colors and contact info
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) return null;

  // 2. Map database colors to global CSS variables
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

      {/* --- PAGE HEADER --- */}
      {/* --- PAGE HEADER --- */}
      {/* THE FIX: Added 'relative overflow-hidden' here */}
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
        {/* THE FIX: Added 'relative z-10' here to pull the text above the background */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--theme-heading)' }}>
            Reach Out
          </span>
          <h1 className="text-4xl md:text-5xl font-black mt-4 mb-6 text-white" >
            Contact Us
          </h1>
          <p className="text-white max-w-2xl mx-auto text-lg leading-relaxed">
            Have a question about a tour, need help with a booking, or want a custom travel package? We are here to help you plan your next great adventure.
          </p>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* LEFT COLUMN: Contact Information */}
          <div className="lg:col-span-1 space-y-10">
            <h3 className="text-2xl font-black" style={{ color: 'var(--theme-heading)', fontFamily:'var(--font-poppins)', fontWeight:"700" }}>
              Get In Touch
            </h3>

            <div className="space-y-8">
              {/* Phone Info */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0" style={{ color: 'var(--theme-primary)' }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"26px"}><path fill="currentColor" d="M112.8 10.9c27.3-9.1 57 3.9 68.9 30l39.7 87.3c10.6 23.4 4 51-16 67.1l-24.2 19.3c25.5 50 65.5 91.4 114.4 118.8l21.2-26.6c16.1-20.1 43.7-26.7 67.1-16l87.3 39.7c26.2 11.9 39.1 41.6 30 68.9-20.7 62.3-83.7 116.2-160.9 102.6-173.7-30.6-299.6-156.5-330.2-330.2-13.6-77.2 40.4-140.1 102.6-160.9zm25.2 49.9c-1.7-3.8-6-5.7-10-4.4-45.2 15.1-79.1 58.6-70.5 107 27.1 153.8 137.4 264.2 291.2 291.3 48.4 8.5 91.9-25.3 107-70.5 1.3-4-.6-8.3-4.4-10L364 334.4c-3.4-1.5-7.4-.6-9.7 2.3l-33.5 41.9c-7 8.7-19 11.5-29 6.7-72.5-34.4-130.5-94.3-162.4-168.2-4.3-9.9-1.4-21.5 7-28.2l38.9-31.1c2.9-2.3 3.9-6.3 2.3-9.7L137.9 60.7z"/></svg></div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>Call Us</p>
                  <p className="text-lg font-black" style={{ color: 'var(--theme-heading)', fontFamily:'var(--font-poppins)', fontWeight:"700" }}>
                    +92 339 3836344
                  </p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Mon-Sat, 10am to 7pm</p>
                </div>
              </div>

              {/* Email Info */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0" style={{ color: 'var(--theme-primary)' }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"26px"}><path fill="currentColor" d="M61.4 64C27.5 64 0 91.5 0 125.4 0 126.3 0 127.1 .1 128L0 128 0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256-.1 0c0-.9 .1-1.7 .1-2.6 0-33.9-27.5-61.4-61.4-61.4L61.4 64zM464 192.3L464 384c0 8.8-7.2 16-16 16L64 400c-8.8 0-16-7.2-16-16l0-191.7 154.8 117.4c31.4 23.9 74.9 23.9 106.4 0L464 192.3zM48 125.4C48 118 54 112 61.4 112l389.2 0c7.4 0 13.4 6 13.4 13.4 0 4.2-2 8.2-5.3 10.7L280.2 271.5c-14.3 10.8-34.1 10.8-48.4 0L53.3 136.1c-3.3-2.5-5.3-6.5-5.3-10.7z"/></svg></div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>Email Us</p>
                  <p className="text-lg font-black" style={{ color: 'var(--theme-heading)', fontFamily:'var(--font-poppins)', fontWeight:"700" }}>
                    hello@axiusdigital.com
                  </p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">We reply within 24 hours</p>
                </div>
              </div>

              {/* Location Info */}
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0" style={{ color: 'var(--theme-primary)' }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width={"22px"}><path fill="currentColor" d="M48 188.6C48 111.7 111.7 48 192 48s144 63.7 144 140.6c0 45.6-23.8 101.5-58.9 157.1-28.3 44.8-61 84.8-85.1 112.1-24.1-27.3-56.7-67.2-85.1-112.1-35.1-55.5-58.9-111.5-58.9-157.1zM192 0C86 0 0 84.4 0 188.6 0 307.9 120.2 450.9 170.4 505.4 182.2 518.2 201.8 518.2 213.6 505.4 263.8 450.9 384 307.9 384 188.6 384 84.4 298 0 192 0zM160 192a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm112 0a80 80 0 1 0 -160 0 80 80 0 1 0 160 0z"/></svg></div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>Visit Us</p>
                  <p className="text-lg font-black" style={{ color: 'var(--theme-heading)', fontFamily:'var(--font-poppins)', fontWeight:"700" }}>
                    {tenant.companyName || 'Axius Digital'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Pakistan</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md border border-gray-100">
              <h3 className="text-2xl font-black mb-8" style={{ color: 'var(--theme-heading)', fontFamily:'var(--font-poppins)', fontWeight:"700" }}>
                Send a Message
              </h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{fontFamily:"var(--font-poppins)", fontWeight:"500"}}>Full Name</label>
                    <input type="text" placeholder="Ali Khan" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-blue-400 transition-colors font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{fontFamily:"var(--font-poppins)", fontWeight:"500"}}>Email Address</label>
                    <input type="email" placeholder="ali@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-blue-400 transition-colors font-medium" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{fontFamily:"var(--font-poppins)", fontWeight:"500"}}>Subject</label>
                  <input type="text" placeholder="Inquiry about Skardu Tour..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-blue-400 transition-colors font-medium" required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest" style={{fontFamily:"var(--font-poppins)", fontWeight:"500"}}>Your Message</label>
                  <textarea rows={5} placeholder="How can we help you?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-blue-400 transition-colors resize-none font-medium" required></textarea>
                </div>

                <button 
                  type="button" 
                  className="w-full text-white font-black py-5 rounded-xl text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-md mt-4" 
                  style={{ backgroundColor: 'var(--theme-primary)', fontFamily:'var(--font-poppins)', fontWeight:"700", fontSize:"16px", cursor:"pointer" }}
                >
                    <div className='flex justify-center gap-3'>
                  Send Message <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width={"10px"}><path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
                  </div>
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>

      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}