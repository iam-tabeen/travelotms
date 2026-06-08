import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';

export default async function RecentTransactionsTable() {
  const [rows, bookingStatusBreakdown] = await Promise.all([
    prisma.payment.findMany({
      select: {
        id: true,
        date: true,
        amount: true,
        method: true,
        booking: {
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            paymentStatus: true,
            tour: { select: { title: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 30,
    }),
    prisma.booking.groupBy({
      by: ['paymentStatus'],
      _count: { _all: true },
      where: { status: { not: 'CANCELLED' } },
    }),
  ]);

  const statusMap = new Map(bookingStatusBreakdown.map((r) => [r.paymentStatus, r._count._all]));

  return (
    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2 className="text-sm md:text-base font-black tracking-widest uppercase text-gray-500">Recent Transactions</h2>
        <div className="text-xs text-gray-500 font-semibold">
          Paid: {statusMap.get('PAID') || 0} | Partial: {statusMap.get('PARTIAL') || 0} | Unpaid: {statusMap.get('UNPAID') || 0}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-3 text-left">Client</th>
              <th className="px-6 py-3 text-left">Tour</th>
              <th className="px-6 py-3 text-left">Method</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-gray-500">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{row.booking?.customerName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{row.booking?.customerEmail || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.booking?.tour?.title || 'Unknown Tour'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">{row.method}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">Rs. {Math.round(row.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {row.booking?.id ? (
                      <Link
                        href={`/dashboard/leads?tab=regular&search=${encodeURIComponent(row.booking.customerEmail || '')}&open=${row.booking.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                      >
                        View Lead <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
