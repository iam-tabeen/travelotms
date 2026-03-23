import Link from 'next/link'; 
import Navbar from '@/components/lovable/Navbar';
import TourCard from '@/components/TourCard';
import HeroSection from '@/components/lovable/HeroSection';
import AboutSection from '@/components/lovable/AboutSection';
import Footer from '@/components/lovable/Footer';
import GallerySection from '@/components/lovable/GallerySection';
import TestimonialsSection from '@/components/lovable/TestimonialsSection';
import CtaBanner from '@/components/lovable/CTASection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  
  // 1. THE HEADLESS CONNECTION
  // We use fetch() to talk to your SaaS engine via the API Key.
  // Replace this string with the actual key you generated!
  const API_KEY = 'tm_live_45c617ad1751be6e7e70d56c2714cfc500ee2d53b54daf0357c5f15bc365aa11'; 
  const API_URL = 'https://travelotms.com'; // Change to https://app.travelotms.com in production

  // 2. FETCH THE DATA
  const res = await fetch(`${API_URL}/api/public/tours`, {
    headers: { 'x-api-key': API_KEY },
    cache: 'no-store' // Equivalent to force-dynamic
  });

  const data = await res.json();

  // If the API key is wrong, or the agency is suspended, show the error
  if (!data.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-red-500">Access Denied</h1>
          <p className="font-medium text-gray-500">{data.error}</p>
        </div>
      </div>
    );
  }

  // 3. DESTRUCTURE THE PAYLOAD
  const { agency, tours } = data;

  // 4. MAP THE API COLORS TO GLOBAL VARIABLES
  const globalTheme = {
    '--theme-primary': agency.primaryColor || '#003580',
    '--theme-accent': agency.accentColor || '#FF8C00',
    '--theme-navbar': agency.navbarColor || '#003580',
    '--theme-button': agency.buttonColor || '#FF8C00',
    '--theme-heading': agency.headingColor || '#1F2937',
    '--theme-footer': agency.footerColor || '#111827', 
    '--theme-card': agency.cardColor || '#111827', 
    '--navlink': agency.navlink || '#111827', 
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-white"  style={globalTheme}>
      
      {/* Clean components using the API data! */}
      <Navbar 
        companyName={agency.companyName} 
        logoUrl={agency.logoUrl} 
      />
      <HeroSection></HeroSection>  
      <AboutSection agencyName={agency.companyName} />

      {/* TOURS GRID SECTION */}
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
            {tours.slice(0, 3).map((tour: any) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>

          {tours.length === 0 && (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest">
                More adventures coming soon!
              </p>
            </div>
          )}

          {tours.length > 3 && (
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

      {/* FOOTER */}
      <Footer companyName={agency.companyName} logoUrl={agency.logoUrl}></Footer>
    </main>
  );
}