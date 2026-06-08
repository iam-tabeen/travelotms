import Navbar from '@/components/Theme1/Navbar';
import Footer from '@/components/Theme1/Footer';
import ContactForm from '@/components/public/ContactForm';
import ContactPageBanner2 from '@/components/Theme2/ContactPageBanner2';
import { getPublicTenant, tenantThemeVars } from '@/lib/public-site';

export const revalidate = 600;

export default async function ContactPage() {
  const tenant = await getPublicTenant();
  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl font-bold">Failed to load agency data.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col" style={tenantThemeVars(tenant)}>
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
      <ContactPageBanner2 />
      <section className="flex-1 py-16 px-6 max-w-3xl mx-auto w-full">
        <ContactForm />
      </section>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}
