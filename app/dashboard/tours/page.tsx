import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteTourButton from '@/components/DeleteTourButton';
import BookingModeDropdown from '@/components/BookingModeDropdown';
import { redirect } from 'next/navigation';
import { getUserAccess } from '@/lib/getTenant';
import DuplicateTourButton from '@/components/DuplicateTourButton';

// 1. IMPORT YOUR NEW HELPER!
import { getTenantForUser } from '@/lib/getTenant'; 

export const dynamic = 'force-dynamic';

export default async function AdminToursPage() {
  // 2. FETCH THE TENANT USING THE HELPER (Handles both Owners & Agents)
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');
  
  const { tenant, role } = access;

  // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
  if (role !== 'OWNER' && role !== 'ADMIN') {
      redirect('/dashboard'); 
  }
  // 3. FETCH DATA USING tenantId (NOT userId!)
  const tours = await prisma.tour.findMany({
    where: { tenantId: tenant.id }, // <--- THIS IS THE CRITICAL FIX
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-10 px-4 sm:px-6 lg:px-10 transition-colors duration-300 tour-bg-main">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        
        <style>{`
          /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
          html.dark .tour-bg-main { background-color: #0F172A !important; }
          html.dark .tour-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
          html.dark .tour-border-main { border-color: #334155 !important; }
          
          html.dark .tour-text-primary { color: #FFFFFF !important; }
          html.dark .tour-text-secondary { color: #94A3B8 !important; }

          /* Table Dark Mode Overrides */
          html.dark .table-card { background: #1E293B; border-color: #334155; }
          html.dark .table-card-header { border-bottom-color: #334155; }
          html.dark .table-card-title { color: #FFFFFF; }
          html.dark .table-card-count { color: #94A3B8; }
          
          html.dark thead { background: #0F172A; }
          html.dark thead th { color: #94A3B8; border-bottom-color: #334155; }
          
          html.dark tbody tr { border-bottom-color: #334155; }
          html.dark tbody tr:hover { background: rgba(30, 41, 59, 0.5); }
          
          html.dark .tour-title { color: #FFFFFF; }
          html.dark .tour-meta { color: #94A3B8; }
          
          html.dark .badge-active { background: rgba(16, 185, 129, 0.1); color: #34D399; }
          html.dark .badge-draft { background: rgba(156, 163, 175, 0.1); color: #9CA3AF; }
          html.dark .tour-badge-purple { background: rgba(139, 92, 246, 0.1) !important; color: #A78BFA !important; border-color: rgba(139, 92, 246, 0.2) !important; }
          
          html.dark .capacity-text { color: #E2E8F0; }
          html.dark .capacity-text.full { color: #F87171; }
          html.dark .capacity-bar-bg { background: #334155; }
          
          html.dark .price-cell { color: #FFFFFF; }
          
          html.dark .icon-btn { background: #1E293B; border-color: #475569; color: #94A3B8; }
          html.dark .icon-btn:hover { background: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3); color: #60A5FA; }
          html.dark .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #F87171; }

          /* ORIGINAL LIGHT THEME STYLES */
          .table-card { background: #fff; border-radius: 24px; border: 1px solid #E5E9F2; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: background-color 0.3s, border-color 0.3s; }
          .table-card-header { padding: 24px 32px; border-bottom: 1px solid #F0F2F7; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.3s; }
          .table-card-title { font-size: 16px; font-weight: 800; color: #0A1628; letter-spacing: -0.01em; transition: color 0.3s; }
          .table-card-count { font-size: 13px; color: #8A93A7; font-weight: 600; margin-top: 4px; transition: color 0.3s; }
          
          table { width: 100%; border-collapse: collapse; }
          thead { background: #F7F9FC; transition: background-color 0.3s; }
          thead th { padding: 16px 32px; font-size: 11px; font-weight: 800; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.08em; text-align: left; border-bottom: 1px solid #E5E9F2; transition: color 0.3s, border-color 0.3s; }
          thead th:last-child { text-align: right; }
          tbody tr { border-bottom: 1px solid #F0F2F7; transition: background 0.15s, border-color 0.3s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #F7F9FC; }
          tbody td { padding: 20px 32px; vertical-align: middle; }
          
          .tour-title { font-size: 15px; font-weight: 700; color: #0A1628; transition: color 0.3s; }
          .tour-meta { font-size: 13px; color: #8A93A7; margin-top: 4px; font-weight: 500; transition: color 0.3s; }
          
          .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; transition: all 0.3s; }
          .badge-active { background: #ECFDF5; color: #059669; }
          .badge-draft  { background: #F3F4F6; color: #6B7280; }
          .badge-active::before, .badge-draft::before { content: ''; width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
          .badge-active::before { background: #10B981; }
          .badge-draft::before  { background: #9CA3AF; }
          
          .capacity-cell { display: flex; flex-direction: column; gap: 6px; min-width: 120px; }
          .capacity-text { font-size: 13px; font-weight: 700; color: #4B5563; transition: color 0.3s; }
          .capacity-text.full { color: #DC2626; }
          .capacity-bar-bg { width: 100%; height: 6px; background: #E5E7EB; border-radius: 10px; overflow: hidden; transition: background-color 0.3s; }
          .capacity-bar-fill { height: 100%; background: #3B82F6; border-radius: 10px; transition: width 0.3s; }
          .capacity-bar-fill.full { background: #DC2626; }
          .capacity-bar-fill.warning { background: #F59E0B; }
          
          .price-cell { font-size: 15px; font-weight: 700; color: #0A1628; transition: color 0.3s; }
          
          .action-btns { display: flex; justify-content: flex-end; gap: 8px; align-items: center; }
          .icon-btn { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1.5px solid #E5E9F2; background: #fff; color: #6B7280; transition: all 0.2s ease; text-decoration: none; cursor: pointer; }
          .icon-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37,99,235,0.1); }
          .icon-btn.delete:hover { background: #FEF2F2; color: #DC2626; border-color: #FECACA; box-shadow: 0 4px 12px rgba(220,38,38,0.1); }

          /* --- MOBILE RESPONSIVE MAGIC & DARK OVERRIDES --- */
          @media (max-width: 1024px) {
            .table-card { border: none; box-shadow: none; background: transparent; overflow: visible; }
            html.dark .table-card { background: transparent !important; border: none; }

            .table-card-header { padding: 0 0 16px 0; border: none; }
            table, thead, tbody, th, td, tr { display: block; }
            thead { display: none; } 
            
            tbody tr { background: #fff; border-radius: 20px; border: 1px solid #E5E9F2; margin-bottom: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
            html.dark tbody tr { background: #1E293B; border-color: #334155; }

            tbody tr:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
            html.dark tbody tr:hover { background: #1E293B; }
            
            tbody td { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F0F2F7; text-align: right; gap: 16px; }
            html.dark tbody td { border-bottom-color: #334155; }
            
            tbody td::before { content: attr(data-label); font-size: 11px; font-weight: 800; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.08em; text-align: left; }
            html.dark tbody td::before { color: #94A3B8; }
            
            tbody td:first-child { display: block; text-align: left; padding: 0 0 16px 0; border-bottom: 2px solid #F4F7F9; margin-bottom: 8px; }
            html.dark tbody td:first-child { border-bottom-color: #0F172A; }
            tbody td:first-child::before { display: none; } 
            
            tbody td:last-child { border-bottom: none; padding-bottom: 0; }
            
            .capacity-cell { align-items: flex-end; width: 130px; }
          }
        `}</style>

        {/* --- HEADER --- */}
        <header className="bg-white rounded-[24px] p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors tour-bg-card tour-border-main">
          <div>
            <h1 className="text-2xl md:text-3xl text-[#0A1628] tracking-tight tour-text-primary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"600"}}>All Tours</h1>
            <p className="text-sm font-medium text-gray-500 mt-2 tour-text-secondary">Manage your active and draft expeditions.</p>
          </div>
          <Link href="/dashboard/add-tour" className="w-full md:w-auto justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Tour
          </Link>
        </header>

        {/* --- TABLE --- */}
        <div className="table-card">
          <div className="table-card-header">
            <div>
              <div className="table-card-title">Tour Inventory</div>
              <div className="table-card-count">{tours.length} total packages</div>
            </div>
          </div>
          
          <div className="w-full">
            <table>
              <thead>
                <tr>
                  <th>Tour Details</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Booking Option</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour: any) => {
                  const isClientChoice = tour.departureType === 'CLIENT_CHOICE';
                  const booked = tour.bookedSpots || 0;
                  const max = tour.maxCapacity || 0;
                  const isInfinity = max === 0; 
                  
                  const isFull = !isInfinity && booked >= max;
                  const percent = isInfinity ? 0 : Math.min((booked / max) * 100, 100);
                  const isWarning = !isInfinity && percent >= 80 && !isFull;

                  return (
                    <tr key={tour.id}>
                      <td data-label="Tour Details">
                        <div className="tour-title">{tour.title}</div>
                        <div className="tour-meta">{tour.destination} &nbsp;·&nbsp; {tour.duration}</div>
                      </td>
                      <td data-label="Status">
                        {tour.status === 'ACTIVE' ? <span className="badge badge-active">Active</span> : <span className="badge badge-draft">Draft</span>}
                      </td>
                      <td data-label="Capacity">
                        {isClientChoice ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-widest whitespace-nowrap transition-colors tour-badge-purple">
                            Client's Choice
                          </span>
                        ) : (
                          <div className="capacity-cell">
                            <span className={`capacity-text ${isFull ? 'full' : ''}`}>
                              {isFull ? 'Sold Out' : `${booked} / ${isInfinity ? '∞' : max} Booked`}
                            </span>
                            {/* Only show the visual bar if there is an actual capacity limit */}
                            {!isInfinity && (
                              <div className="capacity-bar-bg">
                                <div className={`capacity-bar-fill ${isFull ? 'full' : isWarning ? 'warning' : ''}`} style={{ width: `${percent}%` }}></div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td data-label="Booking Mode">
                          <BookingModeDropdown tourId={tour.id} currentMode={tour.bookingMode || 'BOTH'} />
                      </td>
                      <td data-label="Price">
                          <span className="price-cell">Rs. {tour.basePrice.toLocaleString()}</span>
                      </td>
                      <td data-label="Actions">
                        <div className="action-btns">
                        <DuplicateTourButton tourId={tour.id} />
                        
                          <Link href={`/admin/edit-tour/${tour.id}`} className="icon-btn" title="Edit Tour"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></Link>
                          <div className="icon-btn delete"><DeleteTourButton tourId={tour.id} /></div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}