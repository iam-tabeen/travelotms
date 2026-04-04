import { redirect } from 'next/navigation';

export default function SaaSBackendRoot() {
  // Anyone visiting the root of your engine gets instantly bounced to the admin login
  redirect('/admin'); 
}