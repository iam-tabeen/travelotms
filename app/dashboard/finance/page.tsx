import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { getUserAccess } from '@/lib/getTenant';
import FinanceStatsCards from './_components/FinanceStatsCards';
import FinancePaymentMethodChart from './_components/FinancePaymentMethodChart';
import RecentTransactionsTable from './_components/RecentTransactionsTable';
import FinanceExportActions from './_components/FinanceExportActions';
import {
  FinanceStatsSkeleton,
  FinanceChartSkeleton,
  FinanceTableSkeleton,
  FinanceExportButtonSkeleton,
} from './_components/FinanceSkeletons';

export const revalidate = 60;

export default async function FinanceDashboard() {
  const access = await getUserAccess();
  if (!access) redirect('/onboarding');

  const { tenant, role } = access;
  if (role !== 'OWNER' && role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const isPro = tenant.planTier === 'PRO';

  return (
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0A1628] flex items-center gap-3">
              <Wallet className="text-[#2563EB]" size={30} />
              Finances and Billing
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">
              Fast, streamed finance analytics with live payment visibility.
            </p>
          </div>

          <Suspense fallback={<FinanceExportButtonSkeleton />}>
            <FinanceExportActions isPro={isPro} />
          </Suspense>
        </section>

        <Suspense fallback={<FinanceStatsSkeleton />}>
          <FinanceStatsCards />
        </Suspense>

        <Suspense fallback={<FinanceChartSkeleton />}>
          <FinancePaymentMethodChart />
        </Suspense>

        <Suspense fallback={<FinanceTableSkeleton />}>
          <RecentTransactionsTable />
        </Suspense>
      </div>
    </main>
  );
}
