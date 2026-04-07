import { Loader2 } from 'lucide-react';

export default function LeadsLoading() {
  return (
    // bg-[#F4F7F9] light mode ke liye, dark:bg-[#0F172A] dark mode ke liye
    <main className="min-h-screen py-6 md:py-12 px-4 flex flex-col items-center justify-center transition-colors duration-300 bg-[#F4F7F9] dark:bg-[#0F172A]">
      
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
      
      <h2 className="text-2xl font-bold text-[#0A1628] dark:text-white">
        Loading Leads...
      </h2>
      
      <p className="text-gray-500 dark:text-slate-400 mt-2">
        Connecting to database securely
      </p>
      
    </main>
  );
}