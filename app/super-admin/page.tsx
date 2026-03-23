import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { ShieldAlert } from 'lucide-react';
import AgencyRow from './AgencyRow'; 

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
    // 1. DOMAIN RESTRICTION CHECK
    const headersList = await headers();
    const domain = headersList.get('host') || '';

    if (!domain.includes('localhost') && !domain.includes('travelotms.com')) {
        notFound(); 
    }

    // 2. THE MASTER LOCK
    const { userId } = await auth();

    if (!userId || userId !== process.env.SUPER_ADMIN_ID) {
        redirect('/'); 
    }

    // 3. FETCH AGENCIES AND THEIR API KEYS
    const agencies = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { tours: true, bookings: true }
            },
            apiKey: true // <-- THIS BRINGS THE KEY TO THE FRONTEND
        }
    });

    return (
        <main className="min-h-screen bg-gray-900 text-gray-100 p-8 sm:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                            <ShieldAlert className="text-red-500" />
                            Axius HQ / Super Admin
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm font-medium">Manage client subscriptions, access, and system health.</p>
                    </div>
                    <div className="bg-gray-800 px-6 py-3 rounded-xl border border-gray-700 text-center">
                        <span className="block text-2xl font-black text-white">{agencies.length}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Agencies</span>
                    </div>
                </div>

                {/* Agencies Table */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700">
                                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Agency Name</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Usage Stats</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Plan Tier</th>
                                {/* ADDED API KEY COLUMN */}
                                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">API Key</th>
                                <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">System Access</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {agencies.map((agency) => (
                                <AgencyRow key={agency.id} agency={agency} />
                            ))}
                            
                            {agencies.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 font-medium">
                                        No agencies registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </main>
    );
}