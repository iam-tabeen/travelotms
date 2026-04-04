import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardCharts from '@/components/DashboardCharts';
import { Calendar, Clock, MapPin, Activity, Users, ArrowRight, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { getUserAccess } from '@/lib/getTenant'; 

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const access = await getUserAccess();
    if (!access) redirect('/admin/settings');
    
    const { tenant, role } = access;
    
    const canManageTours = ['OWNER', 'ADMIN'].includes(role);

    const toursCount = await prisma.tour.count({ where: { tenantId: tenant.id } });
    const activeToursCount = await prisma.tour.count({ where: { tenantId: tenant.id, status: 'ACTIVE' } });
    
    const leads = await prisma.booking.findMany({
        where: { tenantId: tenant.id }, 
        select: { status: true, totalPrice: true, isWaitlist: true, createdAt: true }
    });

    let confirmedRevenue = 0;
    let pendingRevenue = 0;
    let waitlistCount = 0;
    let newLeads = 0;
    
    let totalLeadsCount = leads.length;
    let convertedLeadsCount = 0;

    leads.forEach(lead => {
        if (lead.status === 'CONFIRMED') {
            confirmedRevenue += lead.totalPrice;
            convertedLeadsCount++; 
        }
        if (lead.status === 'PENDING') {
            pendingRevenue += lead.totalPrice;
            newLeads++;
        }
        if (lead.isWaitlist && lead.status !== 'CANCELLED') waitlistCount++;
    });

    const conversionRate = totalLeadsCount > 0 
        ? Math.round((convertedLeadsCount / totalLeadsCount) * 100) 
        : 0;

    const upcomingTours = await prisma.tour.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' }, 
        take: 4,
        include: {
            _count: {
                select: { bookings: { where: { status: 'CONFIRMED' } } }
            }
        }
    });

    const recentBookings = await prisma.booking.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { 
            tour: { select: { title: true } } 
        }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = monthNames.map(month => ({ name: month, revenue: 0 }));

    leads.forEach(lead => {
        if (lead.status === 'CONFIRMED') {
            const monthIndex = new Date(lead.createdAt).getMonth(); 
            revenueByMonth[monthIndex].revenue += lead.totalPrice;
        }
    });

    const statusData = [
        { name: 'Confirmed', value: leads.filter(l => l.status === 'CONFIRMED').length, fill: '#10B981' }, 
        { name: 'Pending', value: leads.filter(l => l.status === 'PENDING').length, fill: '#F59E0B' }, 
        { name: 'Cancelled', value: leads.filter(l => l.status === 'CANCELLED').length, fill: '#EF4444' }  
    ];

    return (
        <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 dash-bg-main">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
                
                <style>{`
                  /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                  html.dark .dash-bg-main { background-color: #0F172A !important; }
                  html.dark .dash-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                  html.dark .dash-bg-muted { background-color: rgba(30, 41, 59, 0.5) !important; border-color: #334155 !important; }
                  html.dark .dash-bg-icon { background-color: rgba(59, 130, 246, 0.1) !important; border-color: #1E293B !important; color: #60A5FA !important; }
                  
                  html.dark .dash-text-primary { color: #FFFFFF !important; }
                  html.dark .dash-text-secondary { color: #94A3B8 !important; }
                  html.dark .dash-text-blue { color: #60A5FA !important; }
                  html.dark .dash-text-green { color: #4ADE80 !important; }
                  html.dark .dash-text-orange { color: #FB923C !important; }
                  html.dark .dash-text-emerald { color: #10B981 !important; }
                  
                  html.dark .dash-border-main { border-color: #334155 !important; }
                  
                  html.dark .dash-btn-secondary { background-color: #1E293B !important; border-color: #475569 !important; color: #E2E8F0 !important; }
                  html.dark .dash-btn-secondary:hover { background-color: #334155 !important; }
                  
                  html.dark .dash-timeline-line { background-color: #334155 !important; }
                  html.dark .dash-date-badge { background-color: #1E293B !important; border-color: #475569 !important; color: #94A3B8 !important; }
                  html.dark .dash-empty-box { background-color: rgba(30, 41, 59, 0.3) !important; border-color: #334155 !important; }

                  /* Stat Cards Custom overrides */
                  .stat-card { background: #fff; border-radius: 20px; padding: 24px;  box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: center; transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, border-color 0.3s; }
                  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.06); }
                  
                  /* 👇 Fixed border overrides: Only target top, left, right so the bottom border stays colorful! */
                  html.dark .stat-card { 
                      background-color: #1E293B !important; 
                      border-top-color: #334155 !important;
                      border-left-color: #334155 !important;
                      border-right-color: #334155 !important;
                  }
                  html.dark .stat-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
                  
                  .stat-card-title { font-size: 11px; font-weight: 800; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; transition: color 0.3s; }
                  html.dark .stat-card-title { color: #94A3B8 !important; }
                  
                  .stat-card-value { font-weight: 900; font-family: 'DM Serif Display', serif; line-height: 1.1; transition: color 0.3s; }

                  /* Polyfills for card icon colors and gradient in dark mode */
                  html.dark .dash-icon-bg { opacity: 0.15 !important; }

                  .force-emerald { color: #10B981 !important; }
.force-emerald-border { border-bottom-color: #10B981 !important; }

                  /* Confirmed Revenue Card */
                  .stat-card-green { background-image: linear-gradient(to bottom right, white, #f0fdf4); }
                  html.dark .stat-card-green { background-image: linear-gradient(to bottom right, #1E293B, rgba(16, 185, 129, 0.1)) !important; border-bottom-color: #22C55E !important; }
                  html.dark .dash-icon-green { color: #10B981 !important; }

                  /* Pending Revenue Card */
                  .stat-card-amber { background-image: linear-gradient(to bottom right, white, #fffbeb); }
                  html.dark .stat-card-amber { background-image: linear-gradient(to bottom right, #1E293B, rgba(245, 158, 11, 0.1)) !important; border-bottom-color: #F59E0B !important; }
                  html.dark .dash-icon-amber { color: #F59E0B !important; }

                  /* Pending Leads Card */
                  .stat-card-blue { background-image: linear-gradient(to bottom right, white, #eff6ff); }
                  html.dark .stat-card-blue { background-image: linear-gradient(to bottom right, #1E293B, rgba(59, 130, 246, 0.1)) !important; border-bottom-color: #3B82F6 !important; }
                  html.dark .dash-icon-blue { color: #3B82F6 !important; }

                  /* Waitlist Leads Card */
                  .stat-card-orange { background-image: linear-gradient(to bottom right, white, #fff7ed); }
                  html.dark .stat-card-orange { background-image: linear-gradient(to bottom right, #1E293B, rgba(249, 115, 22, 0.1)) !important; border-bottom-color: #F97316 !important; }
                  html.dark .dash-icon-orange { color: #F97316 !important; }

                  /* Conversion Rate Card */
                  .stat-card-emerald { background-image: linear-gradient(to bottom right, white, #ecfdf5); }
                  html.dark .stat-card-emerald { background-image: linear-gradient(to bottom right, #1E293B, rgba(16, 185, 129, 0.1)) !important; border-bottom-color: #10B981 !important; }
                  html.dark .dash-icon-emerald { color: #10B981 !important; opacity: 0.15 !important; }
                `}</style>

                {/* HEADER */}
                <header className="bg-white rounded-[24px] p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors dash-bg-card">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] tracking-tight dash-text-primary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>Agency Overview</h1>
                        <p className="text-sm font-medium text-gray-500 mt-2 dash-text-secondary">Welcome back. Here is your current business performance.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        {canManageTours && (
                            <Link href="/admin/tours" className="w-full sm:w-auto text-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold transition-colors dash-btn-secondary">
                                Manage Tours
                            </Link>
                        )}
                        <Link href="/admin/leads" className="w-full sm:w-auto text-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-md">
                            View Leads
                        </Link>
                    </div>
                </header>

                {/* METRICS SECTION */}
                <section>
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2 mt-2 dash-text-secondary">Top Level Metrics</h2>
                    
                    {/* 1. Changed to a 6-column grid on large screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
                        
                        {/* 2. Top Row Cards: Span 3 columns each (50% width) */}
                        <div className="stat-card border-b-[3px] border-b-green-500 relative overflow-hidden stat-card-green sm:col-span-1 lg:col-span-3">
                            <div className="absolute top-4 right-4 text-green-500 opacity-20 dash-icon-bg dash-icon-green dash-text-green">
                                <DollarSign size={48} strokeWidth={3} />
                            </div>
                            <div className="stat-card-title z-10 relative">Confirmed Revenue</div>
                            <div className="stat-card-value text-green-600 text-2xl md:text-[32px] dash-text-green z-10 relative" style={{fontFamily: 'var(--font-poppins)', fontWeight:"600"}}>
                                Rs. {confirmedRevenue.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold flex gap-1 mt-1 z-10 relative dash-text-secondary">
                                Confirmed Leads <ArrowRight size={10} className="inline" /> Total Revenue
                            </div>
                        </div>
                        
                        <div className="stat-card border-b-[3px] border-b-amber-500 relative overflow-hidden stat-card-amber sm:col-span-1 lg:col-span-3">
                            <div className="absolute top-4 right-4 text-orange-500 opacity-20 dash-icon-bg dash-icon-amber dash-text-orange">
                                <CreditCard size={48} strokeWidth={3} />
                            </div>
                            <div className="stat-card-title z-10 relative">Pending Revenue</div>
                            <div className="stat-card-value text-orange-500 text-2xl md:text-[32px] dash-text-orange z-10 relative" style={{fontFamily: 'var(--font-poppins)', fontWeight:"600"}}>
                                Rs. {pendingRevenue.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold flex gap-1 mt-1 z-10 relative dash-text-secondary">
                                Pending leads <ArrowRight size={10} className="inline" /> Expected Revenue
                            </div>
                        </div>

                        {/* 3. Bottom Row Cards: Span 2 columns each (33% width) */}
                        <div className="stat-card border-b-[3px] border-b-blue-500 relative overflow-hidden stat-card-blue sm:col-span-1 lg:col-span-2">
                            <div className="absolute top-4 right-4 text-blue-500 opacity-20 dash-icon-bg dash-icon-blue dash-text-blue">
                                <Users size={48} strokeWidth={3} />
                            </div>
                            <div className="stat-card-title z-10 relative">Pending Leads</div>
                            <div className="stat-card-value text-blue-500 text-2xl md:text-[32px] dash-text-blue z-10 relative" style={{fontFamily: 'var(--font-poppins)', fontWeight:"600"}}>{newLeads}</div>
                            <div className="text-[10px] text-gray-400 font-bold flex gap-1 mt-1 z-10 relative dash-text-secondary">
                                Active leads <ArrowRight size={10} className="inline" /> Total Leads
                            </div>
                        </div>

                        <div className="stat-card border-b-[3px] border-b-orange-500 relative overflow-hidden stat-card-orange sm:col-span-1 lg:col-span-2">
                            <div className="absolute top-4 right-4 text-orange-500 opacity-20 dash-icon-bg dash-icon-orange dash-text-orange">
                                <Clock size={48} strokeWidth={3} />
                            </div>
                            <div className="stat-card-title z-10 relative">Leads On Waitlist</div>
                            <div className="stat-card-value text-orange-500 text-2xl md:text-[32px] dash-text-orange z-10 relative" style={{fontFamily: 'var(--font-poppins)', fontWeight:"600"}}>{waitlistCount}</div>
                            <div className="text-[10px] text-gray-400 font-bold flex gap-1 mt-1 z-10 relative dash-text-secondary">
                                Waitlist leads <ArrowRight size={10} className="inline" /> Total Waitlist
                            </div>
                        </div>

                        {/* Conversion Rate Card */}
                        <div className="stat-card border-b-[3px] relative overflow-hidden stat-card-emerald force-emerald-border sm:col-span-2 lg:col-span-2">
                            <div className="absolute top-4 right-4 opacity-20 force-emerald">
                                <TrendingUp size={48} strokeWidth={3} />
                            </div>
                            <div className="stat-card-title z-10 relative">Conversion Rate</div>
                            <div className="stat-card-value force-emerald text-3xl md:text-[36px] z-10 relative flex items-baseline gap-1" style={{fontFamily: 'var(--font-poppins)', fontWeight:"800"}}>
                                {conversionRate}%
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold flex gap-1 mt-1 z-10 relative dash-text-secondary">
                                Leads <ArrowRight size={10} className="inline" /> Converted
                            </div>
                        </div>

                    </div>
                </section>

                {/* CHARTS SECTION */}
                <DashboardCharts revenueData={revenueByMonth} statusData={statusData} />

                {/* BOTTOM SECTION: Operations & Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* UPCOMING DEPARTURES */}
                    <div className="xl:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 transition-colors dash-bg-card">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 dash-text-secondary">
                                <Calendar size={16} className="text-[#2563EB] dash-text-blue" />
                                Active Campaigns
                            </h3>
                            
                            {canManageTours && (
                                <Link href="/admin/tours" className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 dash-text-blue">
                                    View All <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            {upcomingTours.length === 0 ? (
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center dash-empty-box">
                                     <p className="text-sm text-gray-500 font-medium dash-text-secondary">No active tours right now.</p>
                                </div>
                            ) : (
                                upcomingTours.map((tour) => {
                                    const capacity = tour.maxCapacity || 20; 
                                    const booked = tour._count.bookings;
                                    const fillPercentage = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
                                    
                                    return (
                                        <div key={tour.id} className="p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-blue-100 bg-white transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row gap-5 md:items-center justify-between dash-bg-card dash-border-main">
                                            <div className="flex-1 w-full min-w-0"> 
                                                <h4 className="font-bold text-gray-900 text-base md:text-lg truncate dash-text-primary">{tour.title}</h4>
                                                <div className="text-[13px] text-gray-500 font-medium mt-2 flex flex-wrap items-center gap-4 dash-text-secondary">
                                                    <span className="flex items-center gap-1.5 shrink-0"><Clock size={14} className="text-blue-500 dash-text-blue" /> {tour.duration}</span>
                                                    <span className="flex items-center gap-1.5 truncate"><MapPin size={14} className="text-orange-500 dash-text-orange shrink-0" /> <span className="truncate">{tour.destination}</span></span>
                                                </div>
                                            </div>
                                            
                                            <div className="w-full md:w-64 shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100 transition-colors dash-bg-muted dash-border-main">
                                                <div className="flex justify-between text-xs font-bold mb-2.5">
                                                    <span className="text-gray-400 uppercase tracking-wider text-[10px] dash-text-secondary">Bookings vs Target</span>
                                                    <span className={fillPercentage >= 90 ? "text-green-600 dash-text-green" : "text-gray-900 dash-text-primary"}>
                                                        {booked} / {capacity > 0 ? capacity : '∞'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden transition-colors">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${fillPercentage >= 90 ? 'bg-green-500' : 'bg-[#2563EB]'}`} 
                                                        style={{ width: `${fillPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RECENT ACTIVITY FEED */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 transition-colors dash-bg-card">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-8 dash-text-secondary">
                            <Activity size={16} className="text-green-500 dash-text-green" />
                            Live Activity
                        </h3>
                        
                        {recentBookings.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center dash-empty-box">
                                <p className="text-sm text-gray-500 font-medium dash-text-secondary">No recent bookings.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentBookings.map((booking, index) => (
                                    <div key={booking.id} className="flex gap-4 relative">
                                        
                                        {/* Vertical Connecting Line */}
                                        {index !== recentBookings.length - 1 && (
                                            <div className="absolute left-5 top-10 bottom-[-16px] w-[2px] bg-gray-100 dash-timeline-line transition-colors"></div>
                                        )}
                                        
                                        {/* Icon Container */}
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 border-[3px] border-white shadow-sm flex items-center justify-center relative z-10 text-[#2563EB] transition-colors dash-bg-icon">
                                            <Users size={16} />
                                        </div>
                                        
                                        {/* Content Card */}
                                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm transition-colors dash-bg-muted dash-border-main">
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <span className="font-bold text-gray-900 text-sm break-words dash-text-primary">{booking.customerName}</span>
                                                <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md shrink-0 transition-colors dash-date-badge">
                                                    {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed dash-text-secondary">
                                                Booked <strong className="text-gray-800 dash-text-primary">{booking.tour?.title || 'a tour'}</strong>
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </main>
    );
}