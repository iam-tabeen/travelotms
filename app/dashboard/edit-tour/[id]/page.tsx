import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditTourForm from './EditTourForm';
import { getUserAccess } from '@/lib/getTenant'; // <-- 1. Import the smart helper

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. Fetch the access object
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');
  
  const { tenant, role } = access;

  // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
  if (role !== 'OWNER' && role !== 'ADMIN') {
      redirect('/dashboard'); 
  }

  const { id } = await params;

  // 3. Fetch the existing tour data
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { itineraryDays: { orderBy: { dayNumber: 'asc' } } }
  });

  // 🛡️ CROSS-TENANT GUARD: Make sure the tour actually belongs to this agency!
  if (!tour || tour.tenantId !== tenant.id) {
      notFound(); 
  }

  return (
    <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24" style={{background:"#f0f2f7"}} >
      <div className="max-w-3xl mx-auto">
        <EditTourForm tour={tour} />
      </div>
    </main>
  );
}