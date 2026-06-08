import prisma from '@/lib/prisma';
import ExportCsvButton from '@/components/ExportCsvButton';
import LeadsFilter from '@/components/LeadsFilter';

export default async function LeadsHeaderCard({
  canManage,
  isPro,
  activeTab,
  statusQuery,
  searchQuery,
}: {
  canManage: boolean;
  isPro: boolean;
  activeTab: string;
  statusQuery: string;
  searchQuery: string;
}) {
  const [regularCount, customCount, exportData] = await Promise.all([
    prisma.booking.count(),
    prisma.customTourLead.count(),
    activeTab === 'regular'
      ? prisma.booking.findMany({
          where: {
            ...(statusQuery !== 'ALL' ? { status: statusQuery } : {}),
            ...(searchQuery
              ? {
                  OR: [
                    { customerName: { contains: searchQuery, mode: 'insensitive' } },
                    { customerEmail: { contains: searchQuery, mode: 'insensitive' } },
                    { customerPhone: { contains: searchQuery, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          select: {
            id: true,
            createdAt: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            totalPrice: true,
            status: true,
            travelDate: true,
            numTravelers: true,
            tour: { select: { title: true } },
          },
          take: 300,
          orderBy: { createdAt: 'desc' },
        })
      : prisma.customTourLead.findMany({
          where: {
            ...(statusQuery !== 'ALL' ? { status: statusQuery } : {}),
            ...(searchQuery
              ? {
                  OR: [
                    { fullName: { contains: searchQuery, mode: 'insensitive' } },
                    { email: { contains: searchQuery, mode: 'insensitive' } },
                    { phone: { contains: searchQuery, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
          select: {
            id: true,
            createdAt: true,
            fullName: true,
            email: true,
            phone: true,
            budget: true,
            status: true,
            destinations: true,
          },
          take: 300,
          orderBy: { createdAt: 'desc' },
        }),
  ]);

  const totalLeads = regularCount + customCount;

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 transition-colors lead-bg-card">
      <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] tracking-tight lead-text-primary" style={{ fontFamily: 'var(--font-poppins)', fontWeight: '700' }}>
            Lead Management
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-sm md:text-base lead-text-secondary">
            Review and manage incoming booking requests.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
          {canManage && <ExportCsvButton leads={exportData} isPro={isPro} activeTab={activeTab} />}
          <div className="bg-blue-50/50 px-8 py-2 rounded-xl border border-blue-100 text-center w-full sm:w-auto flex flex-col items-center justify-center transition-colors lead-bg-blue">
            <span className="block text-3xl md:text-4xl text-[#2563EB] leading-none mb-1.5 lead-text-blue" style={{ fontFamily: 'var(--font-poppins)', fontWeight: '700' }}>
              {totalLeads}
            </span>
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest lead-text-secondary">Total Leads</span>
          </div>
        </div>
      </div>
      <div className="px-6 md:px-8 py-4 bg-gray-50/50 border-t border-gray-100 transition-colors lead-bg-muted lead-border-main">
        <LeadsFilter activeTab={activeTab} />
      </div>
    </div>
  );
}
