import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant';
import ToursStatsCards from './_components/ToursStatsCards';
import ToursTable from './_components/ToursTable';
import { ToursHeaderSkeleton, ToursStatsSkeleton, ToursTableSkeleton } from './_components/ToursSkeletons';

export const revalidate = 30;

function ToursHeader() {
  return (
    <header className="bg-white rounded-[24px] p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors tour-bg-card tour-border-main">
      <div>
        <h1 className="text-2xl md:text-3xl text-[#0A1628] tracking-tight tour-text-primary" style={{ fontFamily: 'var(--font-poppins)', fontWeight: '600' }}>
          All Tours
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-2 tour-text-secondary">Manage your active and draft expeditions.</p>
      </div>
      <Link href="/dashboard/add-tour" className="w-full md:w-auto justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add New Tour
      </Link>
    </header>
  );
}

export default async function AdminToursPage() {
  const access = await getUserAccess();
  if (!access) redirect('/onboarding');

  const { role } = access;
  if (role !== 'OWNER' && role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-10 px-4 sm:px-6 lg:px-10 transition-colors duration-300 tour-bg-main">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        <style>{`
          html.dark .tour-bg-main { background-color: #0F172A !important; }
          html.dark .tour-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
          html.dark .tour-border-main { border-color: #334155 !important; }
          html.dark .tour-text-primary { color: #FFFFFF !important; }
          html.dark .tour-text-secondary { color: #94A3B8 !important; }
        `}</style>

        <Suspense fallback={<ToursHeaderSkeleton />}>
          <ToursHeader />
        </Suspense>

        <Suspense fallback={<ToursStatsSkeleton />}>
          <ToursStatsCards />
        </Suspense>

        <Suspense fallback={<ToursTableSkeleton />}>
          <ToursTable />
        </Suspense>
      </div>
    </main>
  );
}
