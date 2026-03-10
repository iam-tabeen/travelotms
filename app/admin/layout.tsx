import prisma from '@/lib/prisma';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fetch tenant for the global theme and sidebar info
  const tenant = await prisma.tenant.findUnique({ where: { userId } });

  const globalTheme = {
    '--theme-primary': tenant?.primaryColor || '#003580',
    '--theme-accent': tenant?.accentColor || '#FF8C00',
    '--theme-navbar': tenant?.navbarColor || '#003580',
    '--theme-button': tenant?.buttonColor || '#FF8C00',
    '--theme-heading': tenant?.headingColor || '#1F2937',
    '--theme-footer': tenant?.footerColor || '#111827',
    '--theme-card': tenant?.cardColor || '#111827',
    '--navlink': tenant?.navlink || '#111827',
    '--axius-primary': tenant?.primaryColor || '#003580',
    '--axius-secondary': tenant?.headingColor || '#1F2937',
  } as React.CSSProperties;

  return (
    <main style={{ ...globalTheme, fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F0F2F7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');

        * { box-sizing: border-box; }

        .dash-root { display: flex; min-height: 100vh; background: #F0F2F7; }

        /* ── SIDEBAR ── */
        .sidebar { width: 260px; min-width: 260px; background: #0A1628; display: flex; flex-direction: column; padding: 0; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; overflow: hidden; }
        .sidebar-logo { padding: 28px 28px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .sidebar-logo-badge { display: flex; align-items: center; gap: 10px; }
        .sidebar-logo-icon { width: 36px; height: 36px; background: var(--theme-primary, #003580); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .sidebar-logo-text { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.02em; }
        .sidebar-logo-sub { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
        .sidebar-section-label { padding: 24px 28px 8px; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
        .sidebar-nav { padding: 0 14px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 500; text-decoration: none; transition: all 0.15s ease; }
        .sidebar-nav a:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .sidebar-nav a.active { background: var(--theme-primary, #003580); color: #fff; }
        .sidebar-nav a svg { flex-shrink: 0; opacity: 0.8; }
        .sidebar-nav a.active svg { opacity: 1; }
        .sidebar-bottom { margin-top: auto; padding: 20px 28px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 10px; }
        .sidebar-bottom-info { flex: 1; min-width: 0; }
        .sidebar-bottom-name { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-bottom-role { font-size: 11px; color: rgba(255,255,255,0.35); font-weight: 400; }

        /* ── MAIN CONTENT ── */
        .main-content { margin-left: 260px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

        /* ── TOP BAR & SHARED PAGE STYLES ── */
        .topbar { background: #fff; border-bottom: 1px solid #E5E9F2; padding: 0 36px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .topbar-title { font-size: 15px; font-weight: 700; color: #0A1628; letter-spacing: -0.01em; }
        .topbar-breadcrumb { font-size: 12px; color: #8A93A7; font-weight: 400; margin-top: 1px; }
        .topbar-actions { display: flex; align-items: center; gap: 10px; }
        .btn { display: inline-flex; align-items: center; gap: 7px; padding: 0 16px; height: 38px; border-radius: 9px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.15s ease; white-space: nowrap; cursor: pointer; border: none; font-family: inherit; }
        .btn-ghost { background: transparent; color: #4B5563; border: 1.5px solid #E5E9F2; }
        .btn-ghost:hover { background: #F7F9FC; border-color: #C8D0E0; }
        .btn-primary { background: var(--theme-primary, #003580); color: #fff; }
        .btn-primary:hover { opacity: 0.88; }
        .btn-blue { background: #2563EB; color: #fff; }
        .btn-blue:hover { background: #1D4ED8; }
        .page-body { padding: 32px 36px; flex: 1; }
        .dash-footer { background: #fff; border-top: 1px solid #E5E9F2; padding: 14px 36px; display: flex; align-items: center; justify-content: space-between; }
        .dash-footer p { font-size: 12px; color: #B0B8C9; font-weight: 400; }

        @media (max-width: 1024px) { .sidebar { display: none; } .main-content { margin-left: 0; } }
        @media (max-width: 640px) { .page-body { padding: 20px 16px; } .topbar { padding: 0 16px; } .topbar-actions .btn-ghost { display: none; } }
      `}</style>

      <div className="dash-root">
        {/* ── SIDEBAR (FROZEN) ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-badge">
              <div className="sidebar-logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              </div>
              <div>
                <div className="sidebar-logo-text">Travelo TMS</div>
                <div className="sidebar-logo-sub">Tour Management</div>
              </div>
            </div>
          </div>

          <div className="sidebar-section-label">Main Menu</div>
          <nav className="sidebar-nav">
            <Link href="/admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </Link>
            <Link href="/admin/leads">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" ><path fill="currentColor" d="M97.5 64C81.6 64 68.1 75.6 65.8 91.3L34.5 304 135.4 304c10.7 0 20.7 5.3 26.6 14.2l22.5 33.8 142.9 0 22.5-33.8c5.9-8.9 15.9-14.2 26.6-14.2l100.9 0-31.3-212.7C443.9 75.6 430.4 64 414.5 64L97.5 64zM32 416c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-80-103.4 0-22.5 33.8c-5.9 8.9-15.9 14.2-26.6 14.2l-142.9 0c-10.7 0-20.7-5.3-26.6-14.2L135.4 336 32 336 32 416zM34.1 86.7C38.8 55.3 65.7 32 97.5 32l317.1 0c31.7 0 58.7 23.3 63.3 54.7l33.5 227.5c.5 3.1 .7 6.2 .7 9.3l0 92.5c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64l0-92.5c0-3.1 .2-6.2 .7-9.3L34.1 86.7zM339.3 227.3l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-72-72c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L240 249.4 240 128c0-8.8 7.2-16 16-16s16 7.2 16 16l0 121.4 44.7-44.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
              Leads
            </Link>
            <Link href="/admin/add-tour">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add Tour
            </Link>
          </nav>

          <div className="sidebar-section-label">Settings</div>
          <nav className="sidebar-nav">
            <Link href="/admin/settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M185.9 112.3c-6.5 3.2-12.8 6.8-18.8 10.9-8.2 5.5-18.5 6.9-28 3.8L67.4 103.2 29.5 168.8 86 219.1c7.4 6.6 11.3 16.2 10.7 26.1-.5 7.2-.5 14.6 0 21.8 .7 9.9-3.3 19.5-10.7 26.1l-56.5 50.2 37.9 65.7 71.7-23.8c9.4-3.1 19.7-1.7 28 3.8 6 4 12.3 7.7 18.8 10.9 8.9 4.4 15.2 12.6 17.2 22.3l15.2 74 75.8 0 15.2-74c2-9.7 8.4-17.9 17.2-22.3 6.5-3.2 12.8-6.8 18.8-10.9 8.2-5.5 18.5-6.9 28-3.8l71.7 23.8 37.9-65.7-56.5-50.2c-7.4-6.6-11.3-16.2-10.7-26.1 .2-3.6 .4-7.2 .4-10.9s-.1-7.3-.4-10.9c-.7-9.9 3.3-19.5 10.7-26.1l56.5-50.2-37.9-65.7-71.7 23.8c-9.4 3.1-19.7 1.7-28-3.8-6-4-12.3-7.7-18.8-10.9-8.9-4.4-15.2-12.6-17.2-22.3l-15.2-74-75.8 0-15.2 74c-2 9.7-8.4 17.9-17.2 22.3zM294.2-16c15.2 0 28.3 10.7 31.3 25.5l15.2 74c7.8 3.8 15.4 8.2 22.6 13.1l71.7-23.8c14.4-4.8 30.2 1.2 37.8 14.4l37.9 65.7c7.6 13.2 4.9 29.8-6.5 39.9L447.9 243c.6 8.6 .6 17.5 0 26l56.5 50.2c11.4 10.1 14 26.8 6.5 39.9l-37.9 65.7c-7.6 13.2-23.4 19.2-37.8 14.4l-71.7-23.8c-7.2 4.8-14.7 9.2-22.6 13.1l-15.2 74c-3.1 14.9-16.2 25.5-31.3 25.5l-75.8 0c-15.2 0-28.3-10.7-31.3-25.5l-15.2-74c-7.8-3.8-15.4-8.2-22.6-13.1L77.5 439.2C63.1 444 47.3 438 39.7 424.8L1.8 359.2c-7.6-13.1-4.9-29.8 6.5-39.9L64.7 269c-.6-8.6-.6-17.5 0-26L8.2 192.8c-11.4-10.1-14-26.8-6.5-39.9L39.7 87.2C47.3 74 63.1 68 77.5 72.8l71.7 23.8c7.2-4.8 14.7-9.2 22.6-13.1l15.2-74C190.1-5.3 203.2-16 218.4-16l75.8 0zM200.3 256a55.7 55.7 0 1 0 111.4 0 55.7 55.7 0 1 0 -111.4 0zm55.4 88a88 88 0 1 1 .6-176 88 88 0 1 1 -.6 176z"/></svg>
              Agency Settings
            </Link>
          </nav>

          <div className="sidebar-bottom">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: "34px", height: "34px" }, userButtonTrigger: { borderRadius: "50%", boxShadow: "none", outline: "none" } } }} />
            <div className="sidebar-bottom-info">
              <div className="sidebar-bottom-name">{tenant?.companyName || "Setup Required"}</div>
              <div className="sidebar-bottom-role">Administrator</div>
            </div>
          </div>
        </aside>

        {/* ── DYNAMIC CONTENT AREA ── */}
        <div className="main-content">
          {children}
        </div>
      </div>
    </main>
  );
}