import HomePage3 from '@/components/Theme3/HomePage3';
import { getCachedPublicTours, getPublicTenant } from '@/lib/public-site';

export const revalidate = 120;

export default async function PublicHomePage() {
  const tenant = await getPublicTenant();
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-red-500">Site Unavailable</h1>
          <p className="font-medium text-gray-500">Agency is not configured or is suspended.</p>
        </div>
      </div>
    );
  }

  const tours = await getCachedPublicTours('', 'newest');
  return <HomePage3 tenant={tenant} tours={tours} />;
}
