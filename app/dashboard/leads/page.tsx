import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant';
import LeadsHeaderCard from './_components/LeadsHeaderCard';
import LeadsTabsData from './_components/LeadsTabsData';
import LeadsDataTable from './_components/LeadsDataTable';
import { LeadsHeaderSkeleton, LeadsTableSkeleton, LeadsTabsSkeleton } from './_components/LeadsSkeletons';

export const revalidate = 30;

export default async function LeadsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const access = await getUserAccess();
  if (!access) redirect('/onboarding');

  const { tenant, role } = access;
  const canManage = role !== 'VIEWER';

  const params = await searchParams;
  const activeTab = params?.tab === 'custom' ? 'custom' : 'regular';
  const searchQuery = params?.search || '';
  const sortQuery = (params?.sort || 'newest') as 'newest' | 'oldest' | 'price-desc' | 'price-asc';
  const statusQuery = params?.status || 'ALL';
  const currentPage = Number(params?.page) > 0 ? Number(params?.page) : 1;

  const companyDisplayName = tenant.companyName || 'AXIUS DIGITAL';
  const isPro = tenant.planTier === 'PRO';

  return (
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 lead-bg-main">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <style>{`
          html.dark .lead-bg-main { background-color: #0F172A !important; }
          html.dark .lead-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
          html.dark .lead-bg-muted { background-color: rgba(30, 41, 59, 0.5) !important; border-color: #334155 !important; }
          html.dark .lead-bg-blue { background-color: rgba(59, 130, 246, 0.1) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
          html.dark .lead-text-primary { color: #FFFFFF !important; }
          html.dark .lead-text-secondary { color: #94A3B8 !important; }
          html.dark .lead-text-blue { color: #60A5FA !important; }
          html.dark .lead-border-main { border-color: #334155 !important; }
          html.dark .lead-divide > :not([hidden]) ~ :not([hidden]) { border-top-color: #334155 !important; }
        `}</style>

        <Suspense fallback={<LeadsHeaderSkeleton />}>
          <LeadsHeaderCard
            canManage={canManage}
            isPro={isPro}
            activeTab={activeTab}
            statusQuery={statusQuery}
            searchQuery={searchQuery}
          />
        </Suspense>

        <Suspense fallback={<LeadsTabsSkeleton />}>
          <LeadsTabsData />
        </Suspense>

        <Suspense fallback={<LeadsTableSkeleton />}>
          <LeadsDataTable
            activeTab={activeTab}
            searchQuery={searchQuery}
            sortQuery={sortQuery}
            statusQuery={statusQuery}
            currentPage={currentPage}
            companyDisplayName={companyDisplayName}
            isPro={isPro}
            canManage={canManage}
            allowPartialPayments={isPro && tenant.allowPartialPayments}
          />
        </Suspense>
      </div>
    </main>
  );
}
