import prisma from '@/lib/prisma';

export default async function ToursStatsCards() {
  const [total, active, draft, soldOut] = await Promise.all([
    prisma.tour.count(),
    prisma.tour.count({ where: { status: 'ACTIVE' } }),
    prisma.tour.count({ where: { status: 'DRAFT' } }),
    prisma.tour.count({ where: { maxCapacity: { not: null }, departureType: { not: 'CLIENT_CHOICE' } } }),
  ]);

  const cards = [
    { title: 'Total Tours', value: total, border: 'border-b-blue-500' },
    { title: 'Active Tours', value: active, border: 'border-b-emerald-500' },
    { title: 'Draft Tours', value: draft, border: 'border-b-amber-500' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {cards.map((c) => (
        <div key={c.title} className={`bg-white rounded-2xl border border-gray-100 border-b-[3px] ${c.border} p-6`}>
          <p className="text-[11px] uppercase tracking-widest font-black text-gray-500">{c.title}</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{c.value}</p>
        </div>
      ))}
    </section>
  );
}
