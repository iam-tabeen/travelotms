"use client";

import { useState } from 'react';
import { updateAgencySettings } from '@/app/dashboard/settings/actions';
import { Lock, Palette, Briefcase, ShieldCheck } from 'lucide-react';
import SettingsSubmitButton from '@/components/SettingsSubmitButton'; 
import ChangePasswordForm from '@/components/ChangePasswordForm';

export default function SettingsTabs({ tenant, isPro }: { tenant: any, isPro: boolean }) {
  const [activeTab, setActiveTab] = useState<'branding' | 'operations' | 'security'>('branding');

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'operations', label: 'Operations & Finance', icon: Briefcase },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ] as const;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 transition-colors duration-300 set-bg-card set-border-subtle">
      
      {/* --- TABS NAVIGATION --- */}
      <div className="flex gap-2 sm:gap-6 border-b border-gray-100 dark:border-slate-700 mb-8 overflow-x-auto hide-scrollbar set-border-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-2 sm:px-4 py-4 text-xs sm:text-sm font-black uppercase tracking-widest border-b-2 transition-all duration-300 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#003580] text-[#003580] dark:border-blue-500 dark:text-blue-500'
                : 'border-transparent text-gray-400 hover:text-slate-500  dark:text-gray-400 dark:hover:text-gray-500'
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- MAIN FORM (For Branding & Operations) --- */}
      <form action={updateAgencySettings} className={activeTab === 'security' ? 'hidden' : 'block'}>
        
        {/* TAB 1: BRANDING */}
        <div className={`space-y-10 animate-in fade-in duration-500 ${activeTab === 'branding' ? 'block' : 'hidden'}`}>
          <div className="space-y-4">
            <label className="text-[12px] font-black text-gray-700 uppercase tracking-[0.2em] set-text-secondary">Agency Name</label>
            <input 
              name="companyName" 
              defaultValue={tenant?.companyName || ""} 
              className="w-full p-5 md:p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none transition-all font-bold text-gray-900 text-lg shadow-inner set-input"
              required
            />
          </div>
          
          <div className="space-y-3 pt-6">
            <label className="text-[12px] font-black text-gray-700 uppercase tracking-[0.2em] set-text-secondary">Agency Logo</label>
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
        </div>

        {/* TAB 2: OPERATIONS & FINANCE */}
        <div className={`space-y-8 animate-in fade-in duration-500 ${activeTab === 'operations' ? 'block' : 'hidden'}`}>
          <div className="flex flex-col gap-2">
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
                    isPro ? "border-gray-300 focus:border-blue-500 bg-white" : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                }`}
            />
            <p className="text-xs text-gray-500 set-text-secondary">
                {isPro ? "Automated monthly backups will be sent to this address." : "Automatic database backups are sent monthly to PRO members."}
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100 set-border-subtle">
            <label className="text-sm font-bold text-gray-700 set-text-primary">Leads & Notifications Email</label>
            <input 
              type="email"
              name="contactEmail" 
              defaultValue={tenant?.contactEmail || ""} 
              placeholder="e.g., bookings@axiusdigital.com"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none transition-all text-gray-900 shadow-inner set-input"
              required
            />
            <p className="text-xs text-gray-500 set-text-secondary mt-2">
              You will receive Contact Form, New Bookings, and Custom Tour requests notifications on this email address.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100 set-border-subtle">
  <label className="text-sm font-bold text-gray-700 set-text-primary">Meta (Facebook) Pixel ID</label>
  <input 
    type="text"
    name="metaPixelId" 
    defaultValue={tenant?.metaPixelId || ""} 
    placeholder="e.g., 123456789012345"
    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none transition-all text-gray-900 shadow-inner set-input"
  />
  <p className="text-xs text-gray-500 set-text-secondary mt-2">
    Enter your Pixel ID to track page views and conversions for Meta Ads.
  </p>
</div>

          <div className="pt-6 border-t border-gray-100 set-border-subtle">
            <h2 className="text-lg font-black text-gray-900 mb-4 set-text-primary">Financial Settings</h2>
            <div className={`p-6 border rounded-2xl flex items-start gap-4 transition-all ${
                isPro ? 'bg-green-50/50 border-green-100 set-pro-card-unlocked' : 'bg-gray-50 border-gray-200 opacity-75 set-pro-card-locked'
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
                        Allow your travel agents to log multiple partial payments, track client balances, and generate installment receipts. If disabled, all bookings will assume 100% upfront payment.
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* This submit button only belongs to Branding & Operations */}
        <div className="pt-10 mt-8 border-t border-gray-100 set-border-subtle">
          <SettingsSubmitButton />
        </div>
      </form>

      {/* TAB 3: SECURITY (Completely outside the main form!) */}
      {activeTab === 'security' && (
        <div className="animate-in fade-in duration-500 pt-2">
          <ChangePasswordForm />
        </div>
      )}
      
    </div>
  );
}