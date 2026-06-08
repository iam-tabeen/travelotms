import prisma from '@/lib/prisma';
import { DollarSign, CreditCard, Receipt } from 'lucide-react';

function toCurrency(value: number) {
  return `Rs. ${Math.max(0, Math.round(value)).toLocaleString()}`;
}

export default async function FinanceStatsCards() {
  // Run independent metrics in parallel for maximum throughput.
  const [paymentAgg, bookingAgg, customBudgets] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { totalPrice: true },
    }),
    prisma.customTourLead.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { budget: true },
    }),
  ]);

  const customPipeline = customBudgets.reduce((sum, lead) => sum + (Number(lead.budget) || 0), 0);
  const totalCollected = paymentAgg._sum.amount ?? 0;
  const regularPipeline = bookingAgg._sum.totalPrice ?? 0;
  const totalPipeline = regularPipeline + customPipeline;
  const totalPending = Math.max(0, totalPipeline - totalCollected);

  const cards = [
    {
      title: 'Cash Collected',
      value: toCurrency(totalCollected),
      caption: `${paymentAgg._count._all} transactions`,
      icon: <DollarSign size={20} className="text-emerald-600" />,
      border: 'border-b-emerald-500',
      badge: 'bg-emerald-50',
    },
    {
      title: 'Awaiting Payment',
      value: toCurrency(totalPending),
      caption: 'Outstanding receivables',
      icon: <CreditCard size={20} className="text-orange-600" />,
      border: 'border-b-orange-500',
      badge: 'bg-orange-50',
    },
    {
      title: 'Total Pipeline',
      value: toCurrency(totalPipeline),
      caption: 'Active booking value',
      icon: <Receipt size={20} className="text-blue-600" />,
      border: 'border-b-blue-500',
      badge: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card) => (
        <div key={card.title} className={`bg-white rounded-2xl p-6 border border-gray-100 border-b-[3px] ${card.border}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.badge}`}>{card.icon}</div>
            <p className="text-[11px] font-black tracking-widest uppercase text-gray-500">{card.title}</p>
          </div>
          <p className="text-2xl font-black text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.caption}</p>
        </div>
      ))}
    </div>
  );
}
