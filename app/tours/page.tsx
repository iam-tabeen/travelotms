import Navbar from '@/components/Theme1/Navbar';
import TourCard3 from '@/components/Theme3/TourCard3';
import Footer from '@/components/Theme1/Footer';
import TourFilters from '@/components/TourFilters';
import TourPageBanner2 from '@/components/Theme2/TourPageBanner2';
import { getCachedPublicTours, getPublicTenant, tenantThemeVars } from '@/lib/public-site';

export const revalidate = 120;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search = params?.search || '';
  const sort = params?.sort || 'newest';

  const tenant = await getPublicTenant();
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-bold">Failed to load agency data.</p>
      </div>
    );
  }

  const tours = await getCachedPublicTours(search, sort);

  return (
    <main className="min-h-screen bg-white flex flex-col" style={tenantThemeVars(tenant)}>
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
      <TourPageBanner2
        title="All Destinations"
        subtitle="Explore the breathtaking beauty of Pakistan with our curated tour packages."
      />
      <section className="flex-1 py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <TourFilters />
        <div className="mb-10 border-b border-gray-200 pb-4">
        <p className="text-gray-500 font-bold">
          Showing <span style={{ color: 'var(--theme-accent)' }}>{tours.length}</span> active packages
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {tours.map((tour) => (
          <TourCard3 key={tour.id} tour={tour} />
        ))}
      </div>
      {tours.length === 0 && (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-2" style={{ color: 'var(--theme-heading)' }}>No Tours Found</h3>
          <p className="text-gray-500 font-medium">We could not find any adventures matching your search.</p>
        </div>
      )}
      </section>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}
