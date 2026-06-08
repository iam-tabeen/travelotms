import prisma from '@/lib/prisma';

function methodLabel(method: string | null) {
  if (!method) return 'Unknown';
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function FinancePaymentMethodChart() {
  const rows = await prisma.payment.groupBy({
    by: ['method'],
    _sum: { amount: true },
    _count: { _all: true },
  });

  const sorted = rows
    .map((r) => ({
      method: methodLabel(r.method),
      total: r._sum.amount ?? 0,
      count: r._count._all,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const max = sorted[0]?.total ?? 1;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
      <h2 className="text-sm md:text-base font-black tracking-widest uppercase text-gray-500 mb-6">Revenue by Payment Method</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500">No payment records yet.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map((row) => {
            const width = Math.max(6, Math.round((row.total / max) * 100));
            return (
              <div key={row.method} className="grid grid-cols-[120px_1fr_120px] gap-3 items-center">
                <p className="text-xs font-bold text-gray-600 truncate">{row.method}</p>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${width}%` }} />
                </div>
                <p className="text-right text-xs font-bold text-gray-900">
                  Rs. {Math.round(row.total).toLocaleString()} <span className="text-gray-500 font-medium">({row.count})</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
