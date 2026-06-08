import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserAccess } from '@/lib/getTenant'; 
import SettingsTabs from '@/components/SettingsTabs'; // <-- Naya component import kiya

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const access = await getUserAccess();

  if (access && access.role !== 'OWNER' && access.role !== 'ADMIN') {
      redirect('/dashboard'); 
  }

  const tenant = access?.tenant || null;
  const isPro = tenant?.planTier === 'PRO';

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10 transition-colors duration-300 set-bg-main">
      
      <style>{`
        /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
        html.dark .set-bg-main { background-color: #0F172A !important; }
        html.dark .set-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
        html.dark .set-bg-muted { background-color: #0F172A !important; border-color: #334155 !important; }
        
        html.dark .set-text-primary { color: #FFFFFF !important; }
        html.dark .set-text-secondary { color: #94A3B8 !important; }
        
        html.dark .set-input { 
            background-color: #0F172A !important; 
            border-color: #334155 !important; 
            color: white !important;
            box-shadow: none !important;
        }
        html.dark .set-input:focus { border-color: #3B82F6 !important; }

        html.dark .set-border-subtle { border-color: #334155 !important; }
        
        html.dark .set-pro-card-locked { background-color: rgba(15, 23, 42, 0.4) !important; border-color: #334155 !important; }
        html.dark .set-pro-card-unlocked { background-color: rgba(16, 185, 129, 0.05) !important; border-color: rgba(16, 185, 129, 0.2) !important; }
      `}</style>

      <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center px-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 set-text-primary">
            Agency Settings
          </h1>
          <Link 
            href="/dashboard" 
            className="text-xs font-black text-gray-500 hover:text-gray-900 tracking-widest uppercase transition-all set-text-secondary bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md set-bg-card set-border-subtle"
          >
            ⬅ Dashboard
          </Link>
        </div>

        {/* Naya Client Component Pass Kiya Data Ke Sath */}
        <SettingsTabs tenant={tenant} isPro={isPro} />
      </div>

    </main>
  );
}