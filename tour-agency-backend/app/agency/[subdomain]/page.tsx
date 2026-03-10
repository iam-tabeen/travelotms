// app/agency/[subdomain]/page.tsx
import prisma from '@/lib/prisma';
import TourCard from '@/components/TourCard';
import { notFound } from 'next/navigation';

// 1. Update the type so Next.js knows params is a Promise
export default async function AgencyStorefront({ 
    params 
  }: { 
    params: Promise<{ subdomain: string }> 
  }) {
    // 2. AWAIT the params before trying to read the subdomain
    const { subdomain } = await params;

  // 3. Fetch ONLY the tenant that matches this URL
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: subdomain },
    include: {
      tours: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tenant) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Dynamic Header Section */}
        <div className="mb-12">
          {/* Automatically display the correct agency's company name! */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {tenant.companyName}
          </h1>
          <p className="text-lg text-gray-600">
            Discover our premium expeditions and adventures.
          </p>
        </div>

        {/* Tour Grid (Only showing this specific agency's tours) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tenant.tours.map((tour: any) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* Empty State */}
        {tenant.tours.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No tours available at the moment.
          </div>
        )}
        
      </div>
    </main>
  );
}