import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant';
import { Wallet, DollarSign, Receipt, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import FinanceExportButton from '@/components/FinanceExportButton'; 

export const dynamic = 'force-dynamic';

export default async function FinanceDashboard() {
    const access = await getUserAccess();
    if (!access) redirect('/admin/settings');
    
    const { tenant, role } = access;

    if (role !== 'OWNER' && role !== 'ADMIN') {
        redirect('/admin'); 
    }

    const isPro = tenant.planTier === 'PRO';

    // 1. Fetch Regular Bookings
    const regularBookings = await prisma.booking.findMany({
        where: { tenantId: tenant.id },
        include: { tour: { select: { title: true } } }
    });

    // 2. Fetch Custom Leads
    const customLeads = await prisma.customTourLead.findMany({
        where: { tenantId: tenant.id }
    });

    let totalCollected = 0;
    let totalPipeline = 0;

    // 3. Combine and standardize data for the table
    const allLeads = [
        ...regularBookings.map(b => ({
            id: b.id,
            type: 'regular',
            date: b.createdAt,
            customerName: b.customerName,
            customerEmail: b.customerEmail,
            tourTitle: b.tour?.title || 'Deleted Tour',
            // Parse to ensure TypeScript knows these are safe numbers for math
            totalPrice: Number(b.totalPrice) || 0,
            amountPaid: Number(b.amountPaid) || 0,
            status: b.status,
            paymentStatus: b.paymentStatus
        })),
        ...customLeads.map(c => ({
            id: c.id,
            type: 'custom',
            date: c.createdAt,
            customerName: c.fullName,
            customerEmail: c.email,
            // 👇 Fixed: Changed destination to destinations
            tourTitle: c.destinations || 'Custom Destination',
            // 👇 Fixed: Wrapped budget in Number() to prevent the += string/number error
            totalPrice: Number(c.budget) || 0, 
            amountPaid: 0, // Assuming custom leads don't have partial payments tracked yet
            status: c.status,
            paymentStatus: c.status === 'CONFIRMED' ? 'UNPAID' : 'PENDING' // Fake a payment status for UI
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

    // 4. Calculate totals safely
    allLeads.forEach(lead => {
        if (lead.status !== 'CANCELLED') {
            totalPipeline += lead.totalPrice;
            totalCollected += lead.amountPaid;
        }
    });

    const totalPending = totalPipeline - totalCollected;

    // Fetch transactions for the export button
    const transactions = await prisma.payment.findMany({
        where: { booking: { tenantId: tenant.id } },
        include: {
            booking: {
                select: {
                    customerName: true,
                    customerEmail: true,
                    tour: { select: { title: true } }
                }
            }
        },
        orderBy: { date: 'desc' } 
    }).catch(() => []); 

    const formattedTransactions = transactions.map((t: any) => ({
        _rawDate: t.paymentDate || t.date || t.createdAt || Date.now(), 
        Payment_ID: t.id,
        Date: new Date(t.paymentDate || t.date || t.createdAt || Date.now()).toLocaleDateString(),
        Amount: t.amount,
        Method: t.paymentMethod,
        Client_Name: t.booking?.customerName || 'Unknown',
        Client_Email: t.booking?.customerEmail || 'Unknown',
        Tour: t.booking?.tour?.title || 'Unknown Tour',
        Notes: t.notes || ''
    }));

    return (
        <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 fin-bg-main">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                <style>{`
                  /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                  html.dark .fin-bg-main { background-color: #0F172A !important; }
                  html.dark .fin-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                  
                  html.dark .fin-text-primary { color: #FFFFFF !important; }
                  html.dark .fin-text-secondary { color: #94A3B8 !important; }
                  html.dark .fin-text-tertiary { color: #E2E8F0 !important; }
                  html.dark .fin-text-green { color: #4ADE80 !important; }
                  html.dark .fin-text-orange { color: #FB923C !important; }
                  
                  html.dark .fin-border-main { border-color: #334155 !important; }
                  html.dark .fin-border-subtle { border-color: #1E293B !important; }
                  
                  html.dark .fin-divide > :not([hidden]) ~ :not([hidden]) { border-top-color: #334155 !important; }
                  html.dark .fin-hover-row:hover { background-color: rgba(30, 41, 59, 0.5) !important; }
                  
                  html.dark .fin-btn { background-color: #1E293B !important; border-color: #475569 !important; color: #E2E8F0 !important; }
                  html.dark .fin-btn:hover { background-color: #334155 !important; }

                  html.dark .fin-metrics-card {
                      background-color: #1E293B !important;
                      border-top-color: #334155 !important;
                      border-left-color: #334155 !important;
                      border-right-color: #334155 !important;
                  }

                  html.dark .fin-badge-green { background-color: rgba(34, 197, 94, 0.1) !important; color: #4ADE80 !important; border-color: rgba(34, 197, 94, 0.2) !important; }
                  html.dark .fin-badge-orange { background-color: rgba(249, 115, 22, 0.1) !important; color: #FB923C !important; border-color: rgba(249, 115, 22, 0.2) !important; }
                  html.dark .fin-badge-blue { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; border-color: rgba(59, 130, 246, 0.2) !important; }
                  html.dark .fin-badge-gray { background-color: #1E293B !important; color: #94A3B8 !important; border-color: #334155 !important; }

                  .metrics-grid-container {
                      display: grid;
                      grid-template-columns: 1fr;
                      gap: 1.5rem;
                      width: 100%;
                  }
                  @media (min-width: 768px) {
                      .metrics-grid-container {
                          grid-template-columns: repeat(3, 1fr);
                      }
                  }

                  @media (max-width: 1024px) {
                    .finance-table { display: block; width: 100%; }
                    .finance-table thead { display: none; }
                    .finance-table tbody { display: flex; flex-direction: column; gap: 16px; width: 100%; }
                    
                    .finance-table tbody tr { 
                        display: flex; 
                        flex-direction: column; 
                        background: #fff; 
                        border-radius: 16px; 
                        border: 1px solid #E5E9F2; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.03); 
                    }
                    html.dark .finance-table tbody tr { background: #1E293B !important; border-color: #334155 !important; }
                    .finance-table tbody td { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px !important; width: 100%; text-align: right; border-bottom: 1px solid #F0F2F7; }
                    html.dark .finance-table tbody td { border-bottom-color: #334155 !important; }
                    .finance-table tbody td:last-child { border-bottom: none; }
                    .finance-table tbody td::before { font-size: 11px; font-weight: 800; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.1em; flex-shrink: 0; margin-right: 16px; margin-top: 2px; text-align: left; }
                    html.dark .finance-table tbody td::before { color: #94A3B8 !important; }
                    
                    .finance-table tbody td:nth-child(1)::before { content: 'Client'; }
                    .finance-table tbody td:nth-child(2)::before { content: 'Tour'; }
                    .finance-table tbody td:nth-child(3)::before { content: 'Financials'; }
                    .finance-table tbody td:nth-child(4)::before { content: 'Status'; }
                    .finance-table tbody td:nth-child(5)::before { content: 'Actions'; margin-top: 8px;}
                  }
                `}</style>

                {/* --- HEADER WITH EXPORT BUTTON --- */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-colors fin-bg-card">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] tracking-tighter flex items-center gap-3 fin-text-primary">
                            <Wallet className="text-[#2563EB]" size={32} />
                            Finances & Billing
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium text-sm md:text-base fin-text-secondary">Track your revenue, pending payments, and client invoices.</p>
                    </div>
                    
                    <FinanceExportButton transactions={formattedTransactions} isPro={isPro} />
                </div>

                {/* --- REAL FINANCIAL METRICS --- */}
                <div className="metrics-grid-container">
                    
                    <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 border-b-[3px] border-b-green-500 shadow-sm flex items-center gap-4 transition-colors fin-metrics-card">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 transition-colors fin-badge-green">
                            <DollarSign size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate fin-text-secondary">Cash Collected</p>
                            <p className="text-xl md:text-2xl font-black text-gray-900 truncate fin-text-primary" style={{fontFamily: 'var(--font-poppins)'}}>Rs. {totalCollected.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 border-b-[3px] border-b-orange-500 shadow-sm flex items-center gap-4 transition-colors fin-metrics-card">
                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 transition-colors fin-badge-orange">
                            <CreditCard size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate fin-text-secondary">Awaiting Payment</p>
                            <p className="text-xl md:text-2xl font-black text-gray-900 truncate fin-text-primary" style={{fontFamily: 'var(--font-poppins)'}}>Rs. {totalPending.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 border-b-[3px] border-b-blue-500 shadow-sm flex items-center gap-4 transition-colors fin-metrics-card">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-colors fin-badge-blue">
                            <Receipt size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate fin-text-secondary">Total Pipeline</p>
                            <p className="text-xl md:text-2xl font-black text-gray-900 truncate fin-text-primary" style={{fontFamily: 'var(--font-poppins)'}}>Rs. {totalPipeline.toLocaleString()}</p>
                        </div>
                    </div>

                </div>

                {/* --- ACCOUNTS RECEIVABLE TABLE --- */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden transition-colors fin-bg-card">
                    
                    <div className="pt-6 px-5 md:pt-8 md:px-8 pb-4">
                        <h2 className="text-sm md:text-base font-black text-[#0A1628] uppercase tracking-widest fin-text-primary">Client Ledgers</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse finance-table">
                            <thead className="border-b border-gray-100 bg-white transition-colors fin-bg-card fin-border-main">
                                <tr>
                                    <th className="px-5 md:px-8 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap fin-text-secondary">Client</th>
                                    <th className="px-5 md:px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap fin-text-secondary">Tour</th>
                                    <th className="px-5 md:px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap fin-text-secondary">Financials</th>
                                    <th className="px-5 md:px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap fin-text-secondary">Status</th>
                                    <th className="px-5 md:px-8 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap fin-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 fin-divide">
                                {allLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-400 font-bold italic fin-text-secondary">
                                            No billing records found.
                                        </td>
                                    </tr>
                                ) : (
                                    allLeads.map((lead) => {
                                        const amountPaid = lead.amountPaid || 0;
                                        const balanceDue = lead.totalPrice - amountPaid;

                                        return (
                                            <tr 
                                                key={lead.id} 
                                                className={`bg-white hover:bg-gray-50/50 transition-colors fin-bg-card fin-hover-row ${lead.status === 'CANCELLED' ? 'opacity-50' : ''}`}
                                            >
                                                
                                                {/* Client Info */}
                                                <td className="px-5 md:px-8 py-5 align-middle border-b border-gray-100 lg:border-none">
                                                    <div className="text-right md:text-left w-full">
                                                        <div className="font-bold text-[#0A1628] text-sm md:text-[15px] leading-tight fin-text-primary flex items-center gap-2 justify-start md:justify-start">
                                                            {lead.customerName}
                                                            {lead.type === 'custom' && (
                                                                <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Custom</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[13px] text-gray-500 font-medium mt-1 fin-text-secondary">{lead.customerEmail}</div>
                                                    </div>
                                                </td>

                                                {/* Tour */}
                                                <td className="px-5 md:px-6 py-5 align-middle border-b border-gray-100 lg:border-none">
                                                    <div className="text-right md:text-left w-full">
                                                        <div className="font-bold text-gray-700 text-sm fin-text-tertiary">{lead.tourTitle}</div>
                                                        <div className="text-xs text-gray-400 mt-1 fin-text-secondary">Booked: {new Date(lead.date).toLocaleDateString()}</div>
                                                    </div>
                                                </td>

                                                {/* Financial Breakdown */}
                                                <td className="px-5 md:px-6 py-5 align-middle border-b border-gray-100 lg:border-none">
                                                    <div className="flex flex-col gap-1.5 text-sm w-full md:w-[180px] ml-auto md:ml-0">
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-gray-500 fin-text-secondary">Total:</span>
                                                            <span className="font-bold text-gray-900 fin-text-primary">Rs. {lead.totalPrice.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 border-b border-gray-100 pb-1.5 fin-border-main">
                                                            <span className="text-gray-500 fin-text-secondary">Paid:</span>
                                                            <span className="font-bold text-green-600 fin-text-green">Rs. {amountPaid.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 pt-1">
                                                            <span className="text-gray-500 font-black fin-text-secondary">Due:</span>
                                                            <span className="font-black text-orange-600 fin-text-orange">Rs. {balanceDue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-5 md:px-6 py-5 align-middle border-b border-gray-100 lg:border-none">
                                                    <div className="flex justify-end md:justify-start w-full">
                                                        {lead.status === 'CANCELLED' ? (
                                                            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-[10px] font-black uppercase tracking-widest fin-badge-gray">
                                                                Voided
                                                            </span>
                                                        ) : lead.paymentStatus === 'PAID' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-md text-[10px] font-black uppercase tracking-widest fin-badge-green">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Paid Full
                                                            </span>
                                                        ) : lead.paymentStatus === 'PARTIAL' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-black uppercase tracking-widest fin-badge-blue">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Partial
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[10px] font-black uppercase tracking-widest fin-badge-orange">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div> Unpaid
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Action Button */}
                                                <td className="px-5 md:px-8 py-5 align-middle text-right border-none">
                                                    <div className="flex justify-end w-full">
                                                        <Link 
                                                            href={`/admin/leads?tab=${lead.type}&search=${encodeURIComponent(lead.customerEmail)}&open=${lead.id}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-sm fin-btn"
                                                        >
                                                            Log Payment
                                                            <ArrowRight size={14} />
                                                        </Link>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}