import prisma from '@/lib/prisma';

import Link from 'next/link';
import DeleteTourButton from '@/components/DeleteTourButton';
import BookingModeDropdown from '@/components/BookingModeDropdown';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';



export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  const tenant = await prisma.tenant.findUnique({ where: { userId } });
  
  if (!tenant) {
    redirect('/admin/settings');
  }

  const tours = await prisma.tour.findMany({
    where: { tenant: { userId } },
    orderBy: { createdAt: 'desc' },
  });

  const activeTours = tours.filter((t: any) => t.status === 'ACTIVE').length;
  const draftTours = tours.filter((t: any) => t.status !== 'ACTIVE').length;

  return (
    <>
      <style>{`
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 28px; }
        .stat-card { background: #fff; border-radius: 14px; padding: 22px 24px; border: 1px solid #E5E9F2; display: flex; align-items: center; gap: 16px; transition: box-shadow 0.15s; }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon-blue  { background: #EFF6FF; color: #2563EB; }
        .stat-icon-green { background: #F0FDF4; color: #16A34A; }
        .stat-icon-amber { background: #FFFBEB; color: #D97706; }
        .stat-value { font-size: 26px; font-weight: 700; color: #0A1628; line-height: 1; font-family: 'DM Serif Display', serif; }
        .stat-label { font-size: 12px; color: #8A93A7; font-weight: 500; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em; }

        .table-card { background: #fff; border-radius: 16px; border: 1px solid #E5E9F2; overflow: hidden; }
        .table-card-header { padding: 20px 24px; border-bottom: 1px solid #F0F2F7; display: flex; align-items: center; justify-content: space-between; }
        .table-card-title { font-size: 15px; font-weight: 700; color: #0A1628; letter-spacing: -0.01em; }
        .table-card-count { font-size: 12px; color: #8A93A7; font-weight: 500; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #F7F9FC; }
        thead th { padding: 12px 20px; font-size: 11px; font-weight: 700; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.08em; text-align: left; border-bottom: 1px solid #E5E9F2; }
        thead th:last-child { text-align: right; }
        tbody tr { border-bottom: 1px solid #F0F2F7; transition: background 0.1s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F7F9FC; }
        tbody td { padding: 14px 20px; vertical-align: middle; }
        .tour-title { font-size: 14px; font-weight: 600; color: #0A1628; }
        .tour-meta { font-size: 12px; color: #8A93A7; margin-top: 2px; }
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
        .badge-active { background: #F0FDF4; color: #15803D; }
        .badge-draft  { background: #F3F4F6; color: #6B7280; }
        .badge-active::before, .badge-draft::before { content: ''; width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .badge-active::before { background: #22C55E; }
        .badge-draft::before  { background: #9CA3AF; }
        .price-cell { font-size: 14px; font-weight: 600; color: #0A1628; }
        .action-btns { display: flex; justify-content: flex-end; gap: 6px; align-items: center; }
        .icon-btn { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1.5px solid #E5E9F2; background: transparent; color: #6B7280; transition: all 0.15s; text-decoration: none; }
        .icon-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
        .icon-btn.delete:hover { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
        .empty-state { text-align: center; padding: 64px 24px; color: #9CA3AF; }
        .empty-state-icon { width: 56px; height: 56px; background: #F3F4F6; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .empty-state p { font-size: 14px; font-weight: 500; }
        @media (max-width: 1024px) { .stats-row { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .stats-row { grid-template-columns: 1fr; } }
      `}</style>

      {/* TOP BAR */}
      <header className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-breadcrumb">Overview of all tour listings</div>
        </div>
        <div className="topbar-actions">
          <Link href="/admin/leads" className="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"} height={"16px"}><path fill="currentColor" d="M112.8 10.9c27.3-9.1 57 3.9 68.9 30l39.7 87.3c10.6 23.4 4 51-16 67.1l-24.2 19.3c25.5 50 65.5 91.4 114.4 118.8l21.2-26.6c16.1-20.1 43.7-26.7 67.1-16l87.3 39.7c26.2 11.9 39.1 41.6 30 68.9-20.7 62.3-83.7 116.2-160.9 102.6-173.7-30.6-299.6-156.5-330.2-330.2-13.6-77.2 40.4-140.1 102.6-160.9zm25.2 49.9c-1.7-3.8-6-5.7-10-4.4-45.2 15.1-79.1 58.6-70.5 107 27.1 153.8 137.4 264.2 291.2 291.3 48.4 8.5 91.9-25.3 107-70.5 1.3-4-.6-8.3-4.4-10L364 334.4c-3.4-1.5-7.4-.6-9.7 2.3l-33.5 41.9c-7 8.7-19 11.5-29 6.7-72.5-34.4-130.5-94.3-162.4-168.2-4.3-9.9-1.4-21.5 7-28.2l38.9-31.1c2.9-2.3 3.9-6.3 2.3-9.7L137.9 60.7z"/></svg>
            View Leads
          </Link>
          <Link href="/admin/add-tour" className="btn btn-blue ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Tour
          </Link>
        </div>
      </header>

      {/* PAGE BODY */}
      <div className="page-body">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
            <div><div className="stat-value" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>{tours.length}</div><div className="stat-label" style={{fontFamily:"var(--font-poppins)"}}>Total Tours</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div><div className="stat-value" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>{activeTours}</div><div className="stat-label" style={{fontFamily:"var(--font-poppins)"}}>Active Listings</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            <div><div className="stat-value" style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>{draftTours}</div><div className="stat-label" style={{fontFamily:"var(--font-poppins)"}}>Draft Tours</div></div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <div>
              <div className="table-card-title">Tour Listings</div>
              <div className="table-card-count">{tours.length} total packages</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Tour Details</th><th>Status</th><th>Booking Option</th><th>Price</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {tours.map((tour: any) => (
                  <tr key={tour.id}>
                    <td><div className="tour-title">{tour.title}</div><div className="tour-meta">{tour.destination} &nbsp;·&nbsp; {tour.duration}</div></td>
                    <td>{tour.status === 'ACTIVE' ? <span className="badge badge-active">Active</span> : <span className="badge badge-draft">Draft</span>}</td>
                    <td><BookingModeDropdown tourId={tour.id} currentMode={tour.bookingMode || 'BOTH'} /></td>
                    <td><span className="price-cell">Rs. {tour.basePrice.toLocaleString()}</span></td>
                    <td>
                      <div className="action-btns">
                        <Link href={`/admin/edit-tour/${tour.id}`} className="icon-btn" title="Edit Tour"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></Link>
                        <div className="icon-btn delete"><DeleteTourButton tourId={tour.id} /></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tours.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
              <p>No tours yet. Add your first tour to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="dash-footer">
        <p>© 2026 Travelo TMS — A product by Axius Digital</p>
        <p>All rights reserved.</p>
      </footer>
    </>
  );
}