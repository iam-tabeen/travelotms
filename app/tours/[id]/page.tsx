import { notFound } from 'next/navigation';
import TourClient from './TourClient';
import Navbar from '@/components/Theme1/Navbar';
import Footer from '@/components/Theme1/Footer';
import {
  getCachedPublicTourDetail,
  getPublicTenant,
  resolveFixedDepartureDate,
  tenantThemeVars,
} from '@/lib/public-site';

export const revalidate = 120;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TourDetail({ params }: Props) {
  const { id } = await params;
  const tenant = await getPublicTenant();
  if (!tenant) notFound();

  const tour = await getCachedPublicTourDetail(id);
  if (!tour) notFound();

  const calculatedFixedDate = resolveFixedDepartureDate(tour);

  return (
    <div style={tenantThemeVars(tenant)}>
      <Navbar companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
      <div className="bg-gray-50 pt-20">
        <TourClient
          tour={tour}
          fixedDate={calculatedFixedDate}
          isPro={tenant.planTier === 'PRO'}
        />
      </div>
      <Footer companyName={tenant.companyName} logoUrl={tenant.logoUrl} />
    </div>
  );
}
