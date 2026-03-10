import prisma from '@/lib/prisma';
import Navbar from '@/components/lovable/Navbar';
import TourCard from '@/components/TourCard';
import Footer from '@/components/lovable/Footer'


export const revalidate = 0; // Ensures the page always fetches the freshest tours

export default async function ToursPage() {
  // 1. Fetch the tenant data AND all active tours
  const tenant = await prisma.tenant.findFirst({
    include: {
      tours: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-bold">Agency setup required. Please visit /admin.</p>
      </div>
    );
  }

  // 2. Map database colors to global CSS variables
  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--navlink': tenant.navlink || '#003580' ,
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827', // Create the new variable
    '--theme-card': tenant.cardColor || '#111827', // Create the new variable
  } as React.CSSProperties;


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col" style={globalTheme}>
      
      {/* 3. Include the Navbar with the dynamic logo */}
      <Navbar 
        companyName={tenant.companyName} 
        logoUrl={tenant.logoUrl} 
      />

      {/* 4. Page Header Section */}
      <section 
  className="relative pt-32 pb-20 px-6 text-center shadow-inner overflow-hidden" 
  style={{ backgroundColor: 'var(--theme-primary)' }}
>
  {/* Background Image Layer */}
  <div 
    className="absolute inset-0 z-0"
    style={{ 
      backgroundImage: 'url("https://res.cloudinary.com/dmjgwmkuy/image/upload/v1772801682/mountains-bg-2_ht6rhu.png")', 
      backgroundSize: 'cover',
      backgroundPosition: 'bottom',
      opacity: 0.1 
    }}
  />

  {/* Content Layer */}
  <div className="relative z-10 max-w-3xl mx-auto">
    <p 
      className="font-black tracking-[0.3em] uppercase text-xs mb-4"
      style={{ color: 'var(--theme-heading)' }}
    >
      Explore Our Packages
    </p>
    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 drop-shadow-md">
      All Destinations
    </h1>
    <p className="text-white/90 text-lg md:text-xl font-medium drop-shadow-sm">
      Find your next great adventure with {tenant.companyName}. We handle the details, you enjoy the journey.
    </p>
  </div>
</section>

      {/* 5. Tours Grid Section */}
      <section className="flex-1 py-20 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        
        {/* Results Counter */}
        <div className="mb-10 border-b border-gray-200 pb-4">
          <p className="text-gray-500 font-bold">
            Showing <span style={{ color: 'var(--theme-accent)' }}>{tenant.tours.length}</span> active packages
          </p>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {tenant.tours.map((tour: any) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* Empty State */}
        {tenant.tours.length === 0 && (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ color: 'var(--theme-heading)' }}>No Tours Found</h3>
            <p className="text-gray-500 font-medium">
              We are currently preparing new adventures. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* 6. Footer */}
      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl}></Footer>
      
    </main>
  );
}