import prisma from '@/lib/prisma';
import RegularLeadRow from '@/components/RegularLeadRow'; 
import CustomLeadRow from '@/components/CustomLeadRow'; 
import LeadsTabs from '@/components/LeadsTabs'; // <-- 1. Import your new Tabs Component
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function LeadsDashboard({
  searchParams, 
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const { userId } = await auth(); 
    if (!userId) return null;

    const params = await searchParams;
    const activeTab = params?.tab || 'regular';
  
    // 2. OPTIMIZATION: Use .count() just to get the numbers for the tabs (Lightning Fast!)
    const regularCount = await prisma.booking.count({
        where: { tour: { tenant: { userId: userId } } }
    });

    const customCount = await prisma.customTourLead.count({
        where: { tenant: { userId: userId } }
    });

    const totalLeads = regularCount + customCount;

    // 3. OPTIMIZATION: Only fetch the heavy data for the tab we are actually looking at!
    let regularBookings: any[] = [];
    let customLeads: any[] = [];

    if (activeTab === 'regular') {
        regularBookings = await prisma.booking.findMany({
            where: { tour: { tenant: { userId: userId } } },
            orderBy: { createdAt: 'desc' },
            include: { tour: { select: { title: true } } }
        });
    } else {
        customLeads = await prisma.customTourLead.findMany({
            where: { tenant: { userId: userId } },
            orderBy: { createdAt: 'desc' }
        });
    }

    return (
        <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-axius-secondary uppercase tracking-tighter">Lead Management</h1>
                        <p className="text-gray-500 mt-2 font-medium">Review and manage incoming booking requests.</p>
                    </div>
                    <div className="bg-axius-primary/10 px-6 py-4 rounded-xl border border-axius-primary/20 text-center">
                        <span className="block text-3xl font-black text-axius-primary">{totalLeads}</span>
                        <span className="text-[10px] font-bold text-axius-secondary uppercase tracking-widest">Total Leads</span>
                    </div>
                </div>

                {/* 4. Use the new Interactive Tabs Component */}
                <LeadsTabs regularCount={regularCount} customCount={customCount} />

                <div className="bg-white rounded-2xl rounded-tl-none shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">Received</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">Client Details</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">
                                        {activeTab === 'regular' ? 'Expedition' : 'Quick Summary'}
                                    </th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">
                                        {activeTab === 'regular' ? 'Pax & Date' : 'Budget'}
                                    </th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">
                                        {activeTab === 'regular' ? 'Value' : 'Status'}
                                    </th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest">
                                        {activeTab === 'regular' ? 'Status & Actions' : 'Actions'}
                                    </th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-gray-100">
                                {/* TAB 1: REGULAR BOOKINGS */}
                                {activeTab === 'regular' && (
                                    regularBookings.length === 0 ? (
                                        <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No regular bookings received yet.</td></tr>
                                    ) : (
                                        regularBookings.map((booking: any) => (
                                            <RegularLeadRow key={booking.id} booking={booking} />
                                        ))
                                    )
                                )}

                                {/* TAB 2: CUSTOM LEADS */}
                                {activeTab === 'custom' && (
                                    customLeads.length === 0 ? (
                                        <tr><td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">No custom requests received yet.</td></tr>
                                    ) : (
                                        customLeads.map((lead: any) => (
                                            <CustomLeadRow key={lead.id} lead={lead} />
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}