import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant';
import AddTourForm from './AddTourForm';

export const dynamic = 'force-dynamic';

export default async function AddTourPage() {
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');
  
  const { role } = access;

  // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
  if (role !== 'OWNER' && role !== 'ADMIN') {
      redirect('/dashboard'); 
  }

  // If they pass the check, render the client-side form!
  return <AddTourForm />;
}