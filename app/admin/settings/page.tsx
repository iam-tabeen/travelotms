import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { updateAgencySettings } from './actions';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { getUserAccess } from '@/lib/getTenant'; 

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const access = await getUserAccess();

  if (access && access.role !== 'OWNER' && access.role !== 'ADMIN') {
      redirect('/admin'); 
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

      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 transition-colors duration-300 set-bg-card set-border-subtle">
        <div className="mb-12 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 set-text-primary">Branding</h1>
          <Link href="/admin" className="text-xs font-black text-gray-400 hover:text-gray-900 tracking-widest uppercase transition-colors set-text-secondary">
            ⬅ Dashboard
          </Link>
        </div>

        <form action={updateAgencySettings} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] set-text-secondary">Agency Name</label>
            <input 
              name="companyName" 
              defaultValue={tenant?.companyName || ""} 
              className="w-full p-5 md:p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none transition-all font-bold text-gray-900 text-lg shadow-inner set-input"
              required
            />
          </div>
          
          <div className="space-y-3 pt-6">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] set-text-secondary">
              Agency Logo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 transition-colors set-bg-muted set-border-subtle">
              
              {tenant?.logoUrl && (
                <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm shrink-0">
                  <img src={tenant.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              
              <div className="flex-1 w-full">
                <input 
                  type="file" 
                  name="logoFile" 
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#003580] dark:file:bg-blue-600 file:text-white hover:file:opacity-90 transition-all cursor-pointer"
                />
                <input type="hidden" name="existingLogoUrl" value={tenant?.logoUrl || ""} />
                <p className="text-xs text-gray-400 mt-2 font-medium set-text-secondary">Recommended: Transparent PNG, 500x500px</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 pt-8 border-t border-gray-100 set-border-subtle">
            {/* Color Grid Helper */}
            {[
                { name: "navbarColor", label: "Navbar Color", sub: "Top navigation bar", def: "#003580" },
                { name: "buttonColor", label: "Button Color", sub: "Primary action buttons", def: "#FF8C00" },
                { name: "primaryColor", label: "Primary Brand", sub: "Icons and overlays", def: "#003580" },
                { name: "accentColor", label: "Accent Color", sub: "Badges and highlights", def: "#FF8C00" },
                { name: "headingColor", label: "Heading Text", sub: "Main titles (H1, H2)", def: "#1F2937" },
                { name: "footerColor", label: "Footer Color", sub: "Bottom footer background", def: "#111827" },
                { name: "navlink", label: "Nav Links Color", sub: "Color for Nav Links", def: "#111827" },
                { name: "cardColor", label: "Card Color", sub: "Card Element backgrounds", def: "#111827" },
            ].map((color) => (
                <div key={color.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-colors set-bg-muted set-border-subtle border border-transparent">
                  <input 
                    type="color" 
                    name={color.name} 
                    defaultValue={(tenant as any)?.[color.name] || color.def} 
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" 
                  />
                  <div>
                    <p className="font-bold text-sm set-text-primary">{color.label}</p>
                    <p className="text-xs text-gray-500 set-text-secondary">{color.sub}</p>
                  </div>
                </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700 set-text-primary">Backup Delivery Email (PRO)</label>
                {!isPro && (
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 set-text-secondary text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                        <Lock size={10} /> Locked
                    </span>
                )}
            </div>
            
            <input 
                type="email" 
                name="backupEmail" 
                defaultValue={isPro ? (tenant?.backupEmail || '') : ''}
                disabled={!isPro}
                placeholder={isPro ? "e.g., IT-vault@myagency.com" : "Upgrade to PRO to set a backup email"} 
                className={`border rounded-xl px-4 py-3 outline-none transition-all set-input ${
                    isPro 
                    ? "border-gray-300 focus:border-blue-500 bg-white" 
                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                }`}
            />
            <p className="text-xs text-gray-500 set-text-secondary">
                {isPro 
                    ? "Automated monthly backups will be sent to this address." 
                    : "Automatic database backups are sent monthly to PRO members."}
            </p>
          </div>

          {/* FINANCIAL SETTINGS SECTION */}
          <div className="pt-8 border-t border-gray-100 set-border-subtle">
            <h2 className="text-lg font-black text-gray-900 mb-4 set-text-primary">Financial Settings</h2>
            
            <div className={`p-6 border rounded-2xl flex items-start gap-4 transition-all ${
                isPro 
                ? 'bg-green-50/50 border-green-100 set-pro-card-unlocked' 
                : 'bg-gray-50 border-gray-200 opacity-75 set-pro-card-locked'
            }`}>
                <div className="pt-1">
                    <input 
                        type="checkbox" 
                        name="allowPartialPayments"
                        value="true"
                        defaultChecked={isPro && (tenant?.allowPartialPayments || false)}
                        disabled={!isPro}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-900 set-text-primary">Enable Installments & Partial Payments</label>
                        {!isPro && (
                            <span className="bg-gray-200 dark:bg-slate-800 text-gray-500 set-text-secondary text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <Lock size={10} /> Pro Feature
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed set-text-secondary">
                        Allow your travel agents to log multiple partial payments, track client balances, and generate installment receipts. 
                        If disabled, all bookings will assume 100% upfront payment.
                    </p>
                </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#003580] dark:bg-blue-600 text-white font-black py-5 md:py-6 rounded-2xl uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl cursor-pointer"
          >
            Save Brand Settings
          </button>
        </form>
      </div>
    </main>
  );
}