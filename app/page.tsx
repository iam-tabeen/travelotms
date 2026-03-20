import prisma from '@/lib/prisma';
import Link from 'next/link'; 
import Navbar from '@/components/lovable/Navbar';
import TourCard from '@/components/TourCard';
import HeroSection from '@/components/lovable/HeroSection';
import AboutSection from '@/components/lovable/AboutSection';
import Footer from '@/components/lovable/Footer';
import GallerySection from '@/components/lovable/GallerySection';
import TestimonialsSection from '@/components/lovable/TestimonialsSection';
import CtaBanner from '@/components/lovable/CTASection';

// 1. THE CACHE KILLER: This forces Next.js to always fetch fresh data!
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  
  // 2. THE BULLETPROOF ID SWITCHER
  const targetTenantId = process.env.NODE_ENV === 'development'
    ? 'local-agency-123' // <--- Paste your Sandbox ID here!
    : '0a469103-94a5-45cf-859d-4dd2fe1d4586'; // This is your Live Vercel ID

  // 3. Fetch the correct agency based on the environment
  const tenant = await prisma.tenant.findUnique({
    where: { 
        id: targetTenantId 
    },
    include: {
      tours: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tenant) return null;

  // 4. Map database colors to global CSS variables
  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827', 
    '--theme-card': tenant.cardColor || '#111827', 
    '--navlink': tenant.navlink || '#111827', 
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-white"  style={globalTheme}>

      
      {/* Clean components without color props! */}
      <Navbar 
        companyName={tenant.companyName} 
        logoUrl={tenant.logoUrl} 
      />
      <HeroSection></HeroSection>  
      <AboutSection agencyName={tenant.companyName} />

      {/* 4. TOURS GRID SECTION */}
      <div className="or-spacer" style={{zIndex:"99"}}>
        <div className="mask"></div>
      </div>

      <section id="tours" className="relative py-24 px-6 sm:px-12 lg:px-24 mx-0" style={{ marginTop:"-20px" }}>
        
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            backgroundImage: "url('/background-1.jpg')", 
            backgroundSize:"cover", 
            backgroundRepeat:"no-repeat",
            backgroundPosition: "center",
            zIndex: "0" 
          }} 
        />

        <div className="relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-center mb-16 gap-4">
            <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
              <span 
                className="text-xs font-black uppercase tracking-[0.3em]"
                style={{ color: 'var(--theme-accent)', fontFamily: 'var(--font-montez)' , fontWeight:"bold", fontSize:"1.2rem" }}>
                Our Best Packages
              </span>
              <h2 
                className="text-4xl font-bold mt-2"
                style={{ color: 'var(--theme-heading)' , fontFamily: 'var(--font-poppins)' , fontWeight:"bold" }}>
                Upcoming Adventures
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* THE FIX: .slice(0, 3) ensures only a maximum of 3 cards are rendered */}
            {tenant.tours.slice(0, 3).map((tour: any) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          {tenant.tours.length === 0 && (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest">
                More adventures coming soon!
              </p>
            </div>
          )}

          {/* THE FIX: Conditionally show a "View More" button if there are > 3 tours */}
          {tenant.tours.length > 3 && (
            <div className="mt-16 flex justify-center">
              <Link 
                href="/tours" 
                style={{ background: 'var(--theme-primary)' }}
                className="text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-xl"
              >
                View All Tours &rarr;
              </Link>
            </div>
          )}
      
        </div>
      </section>

      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>

      <GallerySection></GallerySection>

      <div className="or-spacer">
        <div className="mask"></div>
      </div>

      <TestimonialsSection></TestimonialsSection>

      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>

      <CtaBanner></CtaBanner>

      <div className="or-spacer">
        <div className="mask" id='footerid'></div>
      </div>

      {/* 5. FOOTER */}
      <Footer  companyName={tenant.companyName} logoUrl={tenant.logoUrl}></Footer>
    </main>
  );
}