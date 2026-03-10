import prisma from '@/lib/prisma';
import Navbar from '@/components/lovable/Navbar';
import TourCard from '@/components/TourCard';
import Footer from '@/components/lovable/Footer';
import TourFilters from '@/components/TourFilters';

// 1. THE FIX: Force dynamic is much more reliable than revalidate = 0 for search pages!
export const dynamic = 'force-dynamic';

export default async function ToursPage({
  searchParams, 
}: {
  // 2. THE FIX: Tell TypeScript that searchParams is now a Promise
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  
  // 3. THE FIX: We MUST 'await' the searchParams before we can read them!
  const params = await searchParams;
  const search = params?.search || '';
  const sort = params?.sort || 'newest';

  // 4. Determine the sorting logic (Price & Date only!)
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  // Fetch the tenant AND heavily filter the active tours
  const tenant = await prisma.tenant.findFirst({
    include: {
      tours: {
        where: { 
          status: 'ACTIVE',
          // Only apply the search filter if the user typed something
          ...(search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { destination: { contains: search, mode: 'insensitive' } }
            ]
          } : {})
        },
        orderBy: orderBy
      }
    }
  });

  // ... your existing prisma.tenant.findFirst(...) block ...

  // THE FIX: Intercept the tours and mathematically sort them by ripping out the text!
  if (tenant && tenant.tours) {
    if (sort === 'duration_asc') {
      tenant.tours.sort((a: any, b: any) => parseInt(a.duration) - parseInt(b.duration));
    } else if (sort === 'duration_desc') {
      tenant.tours.sort((a: any, b: any) => parseInt(b.duration) - parseInt(a.duration));
    }
  }


// ... rest of your code ...

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-bold">Agency setup required. Please visit /admin.</p>
      </div>
    );
  }

  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--navlink': tenant.navlink || '#003580' ,
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827', 
    '--theme-card': tenant.cardColor || '#111827', 
  } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col" style={globalTheme}>
      
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />

      {/* Page Header Section */}
      <section 
        className="relative pt-32 pb-20 px-6 text-center shadow-inner overflow-hidden" 
        style={{ backgroundColor: 'var(--theme-primary)' }}
      >
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("https://res.cloudinary.com/dmjgwmkuy/image/upload/v1772801682/mountains-bg-2_ht6rhu.png")', 
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            opacity: 0.1 
          }}
        />

        
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-black text-white tracking-[0.3em] uppercase text-xs mb-4">
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

      <div className="or-spacer">
        <div className="mask"></div>
      </div>

      {/* Tours Grid Section */}
      <section className="flex-1 py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        
        <TourFilters />

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
              We couldn't find any adventures matching your search. Try adjusting your filters!
            </p>
          </div>
        )}
      </section>

      <div className="or-spacer-down">
        <div className="mask"></div>
      </div>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl}></Footer>
      
    </main>
  );
}