import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditTourForm from './EditTourForm';

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch the existing tour data
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { itineraryDays: { orderBy: { dayNumber: 'asc' } } }
  });

  if (!tour) notFound();

  return (
    <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24" style={{background:"#f0f2f7"}} >
      <div className="max-w-3xl mx-auto">
        <EditTourForm tour={tour} />
      </div>
    </main>
  );
}