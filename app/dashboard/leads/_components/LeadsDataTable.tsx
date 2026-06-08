import prisma from '@/lib/prisma';
import Pagination from '@/components/Pagination';
import RegularLeadRow from '@/components/RegularLeadRow';
import CustomLeadRow from '@/components/CustomLeadRow';
import {
  getCustomOrderBy,
  getCustomSearchFilter,
  getRegularOrderBy,
  getRegularSearchFilter,
} from './lead-query-utils';

const ITEMS_PER_PAGE = 10;

export default async function LeadsDataTable({
  activeTab,
  searchQuery,
  sortQuery,
  statusQuery,
  currentPage,
  companyDisplayName,
  isPro,
  canManage,
  allowPartialPayments,
}: {
  activeTab: string;
  searchQuery: string;
  sortQuery: 'newest' | 'oldest' | 'price-desc' | 'price-asc';
  statusQuery: string;
  currentPage: number;
  companyDisplayName: string;
  isPro: boolean;
  canManage: boolean;
  allowPartialPayments: boolean;
}) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const regularWhereClause: any = { ...getRegularSearchFilter(searchQuery) };
  if (statusQuery !== 'ALL') regularWhereClause.status = statusQuery;

  const customWhereClause: any = { ...getCustomSearchFilter(searchQuery) };
  if (statusQuery !== 'ALL') customWhereClause.status = statusQuery;

  let totalPages = 1;
  let regularBookings: any[] = [];
  let customLeads: any[] = [];

  if (activeTab === 'regular') {
    const [filteredCount, data] = await Promise.all([
      prisma.booking.count({ where: regularWhereClause }),
      prisma.booking.findMany({
        where: regularWhereClause,
        orderBy: getRegularOrderBy(sortQuery),
        take: ITEMS_PER_PAGE,
        skip,
        select: {
          id: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          numTravelers: true,
          totalPrice: true,
          status: true,
          specialNotes: true,
          travelDate: true,
          selectedAddOns: true,
          amountPaid: true,
          tour: { select: { title: true } },
          payments: {
            select: { id: true, amount: true, date: true, method: true, notes: true, recordedBy: true },
            orderBy: { date: 'desc' },
          },
        },
      }),
    ]);
    totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE) || 1;
    regularBookings = data;
  } else {
    const [filteredCount, data] = await Promise.all([
      prisma.customTourLead.count({ where: customWhereClause }),
      prisma.customTourLead.findMany({
        where: customWhereClause,
        take: ITEMS_PER_PAGE,
        skip,
        orderBy: getCustomOrderBy(sortQuery),
        select: {
          id: true,
          createdAt: true,
          fullName: true,
          email: true,
          phone: true,
          cityCountry: true,
          dateFrom: true,
          dateTo: true,
          travelers: true,
          accommodation: true,
          budget: true,
          destinations: true,
          tourTypes: true,
          requirements: true,
          status: true,
        },
      }),
    ]);
    totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE) || 1;
    customLeads = data;
  }

  return (
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
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No regular bookings.</td>
              </tr>
            ) : (
              regularBookings.map((booking) => (
                <RegularLeadRow
                  key={booking.id}
                  booking={booking}
                  agencyName={companyDisplayName}
                  isPro={isPro}
                  canManage={canManage}
                  allowPartialPayments={allowPartialPayments}
                />
              ))
            )
          ) : customLeads.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No custom requests.</td>
            </tr>
          ) : (
            customLeads.map((lead) => <CustomLeadRow key={lead.id} lead={lead} canManage={canManage} />)
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 lead-border-main bg-gray-50/30 lead-bg-muted">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
