// app/dashboard/leads/loading.tsx
import { Loader2 } from 'lucide-react';

export default function LeadsLoading() {
  return (
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Loading Leads...</h2>
      <p className="text-gray-500">Connecting to database securely</p>
    </main>
  );
}