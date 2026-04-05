import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { CalendarDays } from 'lucide-react';
import DepartureCalendar from '@/components/DepartureCalendar';
import { getTenantForUser } from '@/lib/getTenant';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const tenant = await getTenantForUser();
    if (!tenant) return null;

    // Fetch all active tours that have a scheduled departure date
    const tours = await prisma.tour.findMany({
        where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
            departureDate: { not: null } // Only fetch tours with a specific date
        },
        include: {
            bookings: true // Include bookings so we can count travelers
        }
    });

    // Format the data for the Client Component
    const calendarEvents = tours.map(tour => {
        // THE FIX: Changed 'pax' to 'numTravelers' to match your Prisma schema!
        const bookedSeats = tour.bookings.reduce((sum, booking) => sum + (booking.numTravelers || 0), 0);
        
        return {
            id: tour.id,
            title: tour.title,
            date: tour.departureDate as Date,
            bookedSeats,
            maxCapacity: tour.maxCapacity || 0,
        };
    });

    return (
        <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 cal-bg-main">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                
                <style>{`
                  /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                  html.dark .cal-bg-main { background-color: #0F172A !important; }
                  html.dark .cal-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                  html.dark .cal-bg-blue-soft { background-color: rgba(59, 130, 246, 0.1) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
                  
                  html.dark .cal-text-primary { color: #FFFFFF !important; }
                  html.dark .cal-text-secondary { color: #94A3B8 !important; }
                  html.dark .cal-text-blue { color: #60A5FA !important; }
                `}</style>

                {/* Header */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors cal-bg-card">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] tracking-tight flex items-center gap-3 cal-text-primary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>
                            <CalendarDays className="text-[#2563EB] cal-text-blue" size={32} />
                            Departure Calendar
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium text-sm md:text-base cal-text-secondary">Track upcoming tour departures and seat availability.</p>
                    </div>
                    
                    <div className="bg-blue-50/50 px-6 py-3 rounded-xl border border-blue-100 text-center flex-shrink-0 transition-colors cal-bg-blue-soft">
                        <span className="block text-2xl md:text-3xl text-[#2563EB] leading-none mb-1 font-black cal-text-blue" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>
                            {calendarEvents.length}
                        </span>
                        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest cal-text-secondary">Upcoming Departures</span>
                    </div>
                </div>

                {/* The Interactive Calendar */}
                <DepartureCalendar events={calendarEvents} />

            </div>
        </main>
    );
}