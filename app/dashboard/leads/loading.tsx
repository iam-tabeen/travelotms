import { Loader2 } from 'lucide-react';

export default function LeadsLoading() {
  return (
    // Yahan aapki custom class "lead-bg-main" lagayi hai
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 flex flex-col items-center justify-center transition-colors duration-300 lead-bg-main">
      
      {/* 🚨 YEH STYLE BLOCK ZAROORI HAI TA AKE LOADING SCREEN KO PATA HO KE DARK MODE KYA HAI */}
      <style>{`
        html.dark .lead-bg-main { background-color: #0F172A !important; }
        html.dark .lead-text-primary { color: #FFFFFF !important; }
        html.dark .lead-text-secondary { color: #94A3B8 !important; }
      `}</style>

      <Loader2 className="w-12 h-12 animate-spin text-[#2563EB] mb-4" />
      
      {/* Yahan aapki custom classes lead-text-primary / secondary lagayi hain */}
      <h2 className="text-2xl font-bold text-[#0A1628] lead-text-primary">
        Loading Leads...
      </h2>
      
      <p className="text-gray-500 font-medium mt-2 lead-text-secondary">
        Fetching latest data securely
      </p>
      
    </main>
  );
}