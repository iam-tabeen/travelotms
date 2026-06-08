import Navbar3 from '@/components/Theme3/NavBar3';
import HeroSection3 from '@/components/Theme3/HeroSection3';
import ProcessSection3 from '@/components/Theme3/ProcessSection3';
import AboutSection3 from '@/components/Theme3/AboutSection3';
import Footer from '@/components/Theme1/Footer';
import GallerySection3 from '@/components/Theme3/GallerySection3';
import CtaBanner2 from '@/components/Theme2/CTASection2';
import ToursSection3 from '@/components/Theme3/ToursSection3';
import CounterSection from '@/components/Theme3/CounterSection';
import TestimonialsSection3 from '@/components/Theme3/TestimonialSection3';
import { tenantThemeVars, type PublicTenant } from '@/lib/public-site';
import type { Tour } from '@prisma/client';

type Props = {
  tenant: PublicTenant;
  tours: Tour[];
};

export default function HomePage3({ tenant, tours }: Props) {
  const globalTheme = tenantThemeVars(tenant);

  return (
    <main className="min-h-screen bg-white" style={globalTheme}>
      <Navbar3 companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
      <HeroSection3 />
      <ProcessSection3 />
      <AboutSection3 />
      <ToursSection3 tours={tours} />
      <GallerySection3 />
      <CounterSection />
      <TestimonialsSection3 />
      <CtaBanner2 />
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </main>
  );
}
