import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import CreatePromoForm from '@/components/CreatePromoForm'; 
import TogglePromoButton from '@/components/TogglePromoButton'; 
import { Tag, Percent, Banknote, CalendarX, Users, Lock, TicketPercent } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant'; 

export const dynamic = 'force-dynamic';

export default async function PromosDashboard() {
    const access = await getUserAccess();

    if (!access) {
        return (
            <div className="p-12 text-center mt-20">
                <h2 className="text-2xl font-black text-gray-800">Agency Not Found</h2>
                <p className="text-gray-500 mt-2">We could not find an agency linked to your account. Please check your database.</p>
            </div>
        );
    }

    const { tenant, role } = access;

    // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
    if (role !== 'OWNER' && role !== 'ADMIN') {
        redirect('/admin'); 
    }

    // 3. Check if they are PRO
    const isPro = tenant.planTier === 'PRO';

    // 4. Only fetch the promo codes from the database IF they are a PRO member
    const promos = isPro ? await prisma.promoCode.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' }
    }) : [];

    return (
        <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24 transition-colors duration-300 promo-bg-main">
            
            {/* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */}
            <style>{`
                html.dark .promo-bg-main { background-color: #0F172A !important; }
                html.dark .promo-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .promo-bg-muted { background-color: #0F172A !important; border-color: #334155 !important; }
                
                html.dark .promo-border-main { border-color: #334155 !important; }
                html.dark .promo-divide > :not([hidden]) ~ :not([hidden]) { border-top-color: #334155 !important; }
                html.dark .promo-hover-row:hover { background-color: rgba(30, 41, 59, 0.5) !important; }
                
                html.dark .promo-text-primary { color: #FFFFFF !important; }
                html.dark .promo-text-secondary { color: #94A3B8 !important; }
                
                html.dark .promo-badge-blue { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; border-color: rgba(59, 130, 246, 0.2) !important; }
                html.dark .promo-btn-dark { background-color: #334155 !important; color: #E2E8F0 !important; }
                html.dark .promo-btn-dark:hover { background-color: #475569 !important; }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors promo-bg-card promo-border-main">
                    <div>
                        <h1 className="text-3xl font-black text-axius-secondary uppercase tracking-tighter flex items-center gap-3 promo-text-primary">
                            <TicketPercent className="text-blue-500" size={32} />
                            Marketing & Discounts
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium promo-text-secondary">Create and manage promo codes for your campaigns.</p>
                    </div>
                    
                    {/* Only show the Creation Form if they are PRO */}
                    {isPro && <CreatePromoForm tenantId={tenant.id} />}
                </div>

                {!isPro ? (
                    /* PRO UPSELL CARD */
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] p-12 text-center shadow-sm transition-colors promo-bg-card promo-border-main">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors promo-bg-muted promo-border-main border border-transparent">
                            <Lock className="text-gray-400 promo-text-secondary" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-axius-secondary uppercase tracking-tighter promo-text-primary">Unlock Promo Codes</h2>
                        <p className="text-gray-500 max-w-md mx-auto mt-4 leading-relaxed promo-text-secondary">
                            Run seasonal sales, offer VIP discounts, and track campaign success with custom promo codes. Exclusive to <strong className="promo-text-primary">PRO members</strong>.
                        </p>
                        <a 
                            href="https://travelotms.com/pricing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-md w-full sm:w-auto cursor-pointer promo-btn-dark"
                        >
                            Upgrade to Pro
                        </a>
                    </div>
                ) : (
                    /* PROMOS TABLE (For Pro Users Only) */
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden transition-colors promo-bg-card promo-border-main">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 transition-colors promo-bg-muted promo-border-main">
                                        <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest promo-text-secondary">Code</th>
                                        <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest promo-text-secondary">Value</th>
                                        <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest promo-text-secondary">Usage</th>
                                        <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest promo-text-secondary">Expires</th>
                                        <th className="p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right promo-text-secondary">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 promo-divide">
                                    {promos.length === 0 ? (
                                        <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold italic promo-text-secondary">No promo codes active. Create one above!</td></tr>
                                    ) : (
                                        promos.map((promo: any) => (
                                            <tr key={promo.id} className={`hover:bg-gray-50/50 transition-colors promo-hover-row ${!promo.isActive ? 'opacity-50 grayscale' : ''}`}>
                                                <td className="p-6">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-axius-primary/10 text-axius-primary border border-axius-primary/20 rounded-lg font-black tracking-widest uppercase text-sm transition-colors promo-badge-blue">
                                                        <Tag size={14} /> {promo.code}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 font-black text-axius-secondary text-lg promo-text-primary">
                                                        {promo.discountType === 'PERCENTAGE' ? <Percent size={18} className="text-gray-400 promo-text-secondary"/> : <Banknote size={18} className="text-gray-400 promo-text-secondary"/>}
                                                        {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `Rs. ${promo.discountValue.toLocaleString()} OFF`}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 promo-text-secondary">
                                                        <Users size={16} className="text-gray-400 promo-text-secondary"/>
                                                        {promo.timesUsed} / {promo.usageLimit ? promo.usageLimit : '∞'} used
                                                    </div>
                                                    {promo.usageLimit && promo.timesUsed >= promo.usageLimit && (
                                                        <span className="text-[10px] text-red-500 uppercase tracking-widest font-black block mt-1">Limit Reached</span>
                                                    )}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600 promo-text-secondary">
                                                        <CalendarX size={16} className="text-gray-400 promo-text-secondary"/>
                                                        {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : 'Never expires'}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <TogglePromoButton id={promo.id} isActive={promo.isActive} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}