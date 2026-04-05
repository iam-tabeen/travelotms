import prisma from '@/lib/prisma';
import RegularLeadRow from '@/components/RegularLeadRow'; 
import CustomLeadRow from '@/components/CustomLeadRow'; 
import LeadsTabs from '@/components/LeadsTabs'; 
import ExportCsvButton from '@/components/ExportCsvButton'; 
import LeadsFilter from '@/components/LeadsFilter'; 
import Pagination from '@/components/Pagination'; 
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant'; 

export const dynamic = 'force-dynamic';
const ITEMS_PER_PAGE = 10; 

export default async function LeadsDashboard({
  searchParams, 
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const access = await getUserAccess();
    if (!access) redirect('/dashboard/settings');

    const { tenant, role } = access;
    const canManage = role !== 'VIEWER';

    const params = await searchParams;
    const activeTab = params?.tab || 'regular';
    const searchQuery = params?.search || '';
    const sortQuery = params?.sort || 'newest';
    const statusQuery = params?.status || 'ALL'; 
    const currentPage = Number(params?.page) || 1;

    const companyDisplayName = tenant.companyName || "AXIUS DIGITAL";
    const isPro = tenant.planTier === 'PRO';

    const regularCount = await prisma.booking.count({ where: { tenantId: tenant.id } });
    const customCount = await prisma.customTourLead.count({ where: { tenantId: tenant.id } });
    const totalLeads = regularCount + customCount;

    let regularBookings: any[] = [];
    let customLeads: any[] = [];

    // --- FILTERS ---
    const regularSearchFilter = searchQuery ? {
        OR: [
            { customerName: { contains: searchQuery, mode: 'insensitive' as const } },
            { customerEmail: { contains: searchQuery, mode: 'insensitive' as const } },
            { tour: { title: { contains: searchQuery, mode: 'insensitive' as const } } }
        ]
    } : {};

    const customSearchFilter = searchQuery ? {
        OR: [
            { fullName: { contains: searchQuery, mode: 'insensitive' as const } },
            { email: { contains: searchQuery, mode: 'insensitive' as const } },
            { destination: { contains: searchQuery, mode: 'insensitive' as const } }
        ]
    } : {};

    let orderBy: any = { createdAt: 'desc' }; 
    if (sortQuery === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortQuery === 'price-desc') orderBy = { totalPrice: 'desc' };
    if (sortQuery === 'price-asc') orderBy = { totalPrice: 'asc' };

    let regularWhereClause: any = { tenantId: tenant.id, ...regularSearchFilter };
    if (statusQuery !== 'ALL') regularWhereClause.status = statusQuery;

    let customWhereClause: any = { tenantId: tenant.id, ...customSearchFilter };
    if (statusQuery !== 'ALL') customWhereClause.status = statusQuery;

    // --- MATH & QUERIES ---
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    let totalPages = 1;

    if (activeTab === 'regular') {
        const filteredCount = await prisma.booking.count({ where: regularWhereClause });
        totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

        regularBookings = await prisma.booking.findMany({
            where: regularWhereClause,
            orderBy: orderBy,
            take: ITEMS_PER_PAGE,
            skip: skip,
            include: { 
                tour: { include: { itineraryDays: true } },
                payments: { orderBy: { date: 'desc' } }
            }
        });
    } else {
        const filteredCount = await prisma.customTourLead.count({ where: customWhereClause });
        totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

        customLeads = await prisma.customTourLead.findMany({
            where: customWhereClause,
            take: ITEMS_PER_PAGE,
            skip: skip,
            orderBy: (sortQuery === 'price-desc' || sortQuery === 'price-asc') ? { createdAt: 'desc' } : orderBy
        });
    }

    const exportData = activeTab === 'regular' ? regularBookings : customLeads;

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

                {/* HEADER SECTION */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 transition-colors lead-bg-card">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="w-full md:w-auto">
                            <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] tracking-tight lead-text-primary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>
                                Lead Management
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium text-sm md:text-base lead-text-secondary">Review and manage incoming booking requests.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                            {canManage && <ExportCsvButton leads={exportData} isPro={isPro} activeTab={activeTab} />}
                            <div className="bg-blue-50/50 px-8 py-2 rounded-xl border border-blue-100 text-center w-full sm:w-auto flex flex-col items-center justify-center transition-colors lead-bg-blue">
                                <span className="block text-3xl md:text-4xl text-[#2563EB] leading-none mb-1.5 lead-text-blue" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>{totalLeads}</span>
                                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest lead-text-secondary">Total Leads</span>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 md:px-8 py-4 bg-gray-50/50 border-t border-gray-100 transition-colors lead-bg-muted lead-border-main">
                        <LeadsFilter activeTab={activeTab} />
                    </div>
                </div>

                <LeadsTabs regularCount={regularCount} customCount={customCount} />

                {/* TABLE SECTION */}
                <div className="table-container bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden transition-colors lead-bg-card">
                    <table className={`w-full text-left border-collapse responsive-table ${activeTab === 'regular' ? 'tab-regular' : 'tab-custom'}`}>
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 transition-colors lead-bg-muted lead-border-main">
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest lead-text-secondary">Received</th>
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest lead-text-secondary">Client Details</th>
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest lead-text-secondary">{activeTab === 'regular' ? 'Expedition' : 'Quick Summary'}</th>
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest lead-text-secondary">{activeTab === 'regular' ? 'Pax & Date' : 'Budget'}</th>
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest lead-text-secondary">{activeTab === 'regular' ? 'Value' : 'Status'}</th>
                                <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right lead-text-secondary">{activeTab === 'regular' ? 'Status & Actions' : 'Actions'}</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-100 lead-divide">
                            {activeTab === 'regular' ? (
                                regularBookings.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No regular bookings.</td></tr>
                                ) : (
                                    regularBookings.map((booking) => (
                                        <RegularLeadRow 
                                            key={booking.id} 
                                            booking={booking} 
                                            agencyName={companyDisplayName} 
                                            isPro={isPro} 
                                            canManage={canManage}
                                            allowPartialPayments={isPro && tenant.allowPartialPayments}
                                        />
                                    ))
                                )
                            ) : (
                                customLeads.length === 0 ? (
                                    <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No custom requests.</td></tr>
                                ) : (
                                    customLeads.map((lead) => (
                                        <CustomLeadRow key={lead.id} lead={lead} canManage={canManage} />
                                    ))
                                )
                            )}
                        </tbody>
                    </table>

                    {/* PAGINATION UI */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 lead-border-main bg-gray-50/30 lead-bg-muted">
                            <Pagination currentPage={currentPage} totalPages={totalPages} />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}