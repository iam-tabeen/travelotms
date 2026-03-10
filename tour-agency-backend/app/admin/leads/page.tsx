import prisma from '@/lib/prisma';
import Link from 'next/link';
import BookingStatusDropdown from '@/components/BookingStatusDropdown';
import { auth } from '@clerk/nextjs/server';


// Force Next.js to dynamically fetch fresh leads every time this page loads
export const dynamic = 'force-dynamic';

export default async function LeadsDashboard() {
    const { userId } = await auth(); // Get the logged-in ID
  
    const bookings = await prisma.booking.findMany({
      where: {
        tour: { tenant: { userId: userId } } // ONLY fetch leads for this user's tours
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tour: { select: { title: true } }
      }
    });
    // ... rest of the file stays the same

    return (
        <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-between items-center">
                    <div>
                    <div  className='inline-flex items-center mb-4 row bg-[#000000] hover:bg-[#363636] transition-all' style={{ paddingLeft:"16px" , paddingRight:"16px", paddingTop:"10px", paddingBottom:"10px", borderRadius:"20px", width:"200px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} style={{marginRight:"10px"}} ><path fill="white" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
        <Link href="/admin" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500" , fontSize:"14px", textDecoration:"none"}} className="text-sm font-bold text-white hover:underline  inline-block" >
         Back to Dashboard
            </Link>
            </div>
                        <h1 className="text-3xl font-black text-axius-secondary uppercase tracking-tighter">Lead Management</h1>
                        <p className="text-gray-500 mt-2 font-medium">Review and manage incoming booking requests.</p>
                    </div>
                    <div className="bg-axius-primary/10 px-6 py-4 rounded-xl border border-axius-primary/20 text-center">
                    
                        <span className="block text-3xl font-black text-axius-primary">{bookings.length}</span>
                        <span className="text-[10px] font-bold text-axius-secondary uppercase tracking-widest">Total Leads</span>
                    </div>
                  
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Received</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Client Details</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Expedition</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Pax & Date</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Potential Value</th>
                                    <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400 font-bold italic">
                                            No leads received yet. Time to run some ads!
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Received Date */}
                                            <td className="p-6 text-sm font-bold text-gray-500">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </td>

                                            {/* Client Details */}
                                            <td className="p-6">
                                                <div className="font-black text-axius-secondary">{booking.customerName}</div>
                                                <div className="text-sm text-axius-primary font-bold mt-1">📱 {booking.customerPhone}</div>
                                                <div className="text-xs text-gray-500 mt-1">✉️ {booking.customerEmail}</div>
                                            </td>

                                            {/* Expedition */}
                                            <td className="p-6 text-sm font-bold text-axius-secondary">
                                                {booking.tour?.title || "Deleted Tour"}
                                                {booking.specialNotes && (
                                                    <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                                                        <span className="font-black">Note:</span> {booking.specialNotes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Pax & Date */}
                                            <td className="p-6">
                                                <div className="text-sm font-bold text-gray-700">
                                                    👥 {booking.numTravelers} Travelers
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 mt-1">
                                                    📅 {new Date(booking.travelDate).toLocaleDateString()}
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td className="p-6 text-lg font-black text-green-600">
                                                Rs. {booking.totalPrice.toLocaleString()}
                                            </td>

                                            {/* Status */}
                                            {/* Interactive Status Dropdown */}
                                            <td className="p-6">
                                                <BookingStatusDropdown
                                                    bookingId={booking.id}
                                                    currentStatus={booking.status}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}