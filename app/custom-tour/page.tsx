import Navbar from '@/components/Theme1/Navbar';
import Footer from '@/components/Theme1/Footer';
import CustomTourForm from '@/components/public/CustomTourForm';
import CustomTripHeader2 from '@/components/Theme2/CustomTripHeader2';
import { getPublicTenant, tenantThemeVars } from '@/lib/public-site';
import { notFound } from 'next/navigation';

export const revalidate = 600;

export default async function CustomTourPage() {
  const tenant = await getPublicTenant();
  if (!tenant) notFound();

  return (
    <main className="min-h-screen bg-white flex flex-col" style={tenantThemeVars(tenant)}>
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
      <CustomTripHeader2 />
      <section className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full">
        <CustomTourForm />
      </section>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}
