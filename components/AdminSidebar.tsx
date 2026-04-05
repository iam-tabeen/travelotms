"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, Map, Users, PlusCircle, Tag, Settings,
  ChevronLeft, Menu, DatabaseBackup, CalendarDays, Landmark,
  Moon, Sun
} from 'lucide-react';

export default function AdminSidebar({ role = 'VIEWER' }: { role?: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const ALL_ROLES = ['OWNER', 'ADMIN', 'AGENT', 'VIEWER'];
  const ADMIN_ONLY = ['OWNER', 'ADMIN'];

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, allowed: ALL_ROLES },
    { name: 'All Tours', path: '/admin/tours', icon: Map, allowed: ADMIN_ONLY },
    { name: 'Leads', path: '/admin/leads', icon: Users, allowed: ALL_ROLES },
    { name: 'Finance', path: '/admin/finance', icon: Landmark, allowed: ADMIN_ONLY },
    { name: 'Add Tour', path: '/admin/add-tour', icon: PlusCircle, allowed: ADMIN_ONLY },
    { name: 'Departure Calendar', path: '/admin/calendar', icon: CalendarDays, allowed: ALL_ROLES },
    { name: 'Promo Codes', path: '/admin/promos', icon: Tag, allowed: ADMIN_ONLY },
    { name: 'Backups', path: '/admin/backups', icon: DatabaseBackup, allowed: ADMIN_ONLY },
  ];

  const visibleMenuItems = menuItems.filter(item => item.allowed.includes(role));
  const isAdmin = ADMIN_ONLY.includes(role);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <>
      <style>{`
        :root {
          --color-text-primary: #1F2936;
          --color-text-placeholder: #798EAE;
          --color-bg-primary: #f9fafb;
          --color-bg-secondary: #ECECFD;
          --color-bg-sidebar: #FFFFFF;
          --color-border-hr: #E2E8F0;
          --color-hover-primary: #2563EB;
          --color-hover-secondary: #e2e2fb;
          --color-shadow: rgba(0, 0, 0, 0.05);
          --color-text-sidebar-primary: #0A1628;
        }

        .dark {
          --color-text-primary: #F1F5F9;
          --color-text-placeholder: #94A3B8;
          --color-bg-primary: #0F172A;
          --color-bg-secondary: #1E293B; 
          --color-bg-sidebar: #0B1120;
          --color-border-hr: #1E293B; 
          --color-hover-primary: #3B82F6; 
          --color-hover-secondary: #1E293B;
          --color-shadow: rgba(0, 0, 0, 0.5);
          --color-text-sidebar-primary: #FFFFFF;
        }

        .cn-sidebar {
          position: sticky;
          top: 0;
          width: 270px;
          height: 100vh;
          display: flex;
          flex-shrink: 0;
          flex-direction: column;
          background: var(--color-bg-sidebar);
          border-right: 1px solid var(--color-border-hr);
          box-shadow: 0 3px 9px var(--color-shadow);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-x: hidden;
          z-index: 50;
        }

        .cn-sidebar.collapsed { width: 80px; }

        .cn-sidebar-header {
          padding: 20px 15px;
          display: flex;
          position: relative;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-border-hr);
          min-height: 86px;
        }

        .cn-logo-wrapper { width: 140px; transition: opacity 0.2s ease; }
        .cn-logo-wrapper img { width: 100%; height: auto; object-fit: contain; }
        .cn-sidebar.collapsed .cn-logo-wrapper { opacity: 0; visibility: hidden; width: 0; }

        .cn-sidebar-header .cn-sidebar-toggle {
          height: 40px;
          width: 40px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--color-text-primary);
          background: var(--color-bg-secondary);
          transition: 0.3s ease;
        }

        .cn-sidebar.collapsed .cn-sidebar-toggle {
            margin: 0 auto;
        }

        .cn-sidebar.collapsed .cn-sidebar-toggle svg { transform: rotate(180deg); }

        .cn-sidebar-content {
          flex: 1;
          padding: 20px 12px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .cn-menu-heading {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-placeholder);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 15px 5px;
        }

        .cn-sidebar.collapsed .cn-menu-heading { opacity: 0; height: 0; padding: 0; overflow: hidden; }

        .cn-menu-list { display: flex; gap: 4px; flex-direction: column; list-style: none; padding: 0; margin: 0; }

        .cn-menu-link {
          display: flex;
          gap: 12px;
          white-space: nowrap;
          border-radius: 12px;
          padding: 12px 15px;
          align-items: center;
          text-decoration: none;
          color: var(--color-text-primary);
          transition: all 0.2s ease;
        }

        .cn-sidebar.collapsed .cn-menu-link {
            justify-content: center;
            padding: 12px 0;
        }

        .cn-menu-label {
            transition: opacity 0.2s ease;
        }

        .cn-sidebar.collapsed .cn-menu-label { 
            display: none;
        }

        .cn-menu-link:hover, .cn-menu-link.active {
          color: #fff !important;
          background: var(--color-hover-primary);
        }

        /* --- FOOTER SECTION --- */
        .cn-sidebar-footer {
          padding: 20px 15px;
          border-top: 1px solid var(--color-border-hr);
        }

        .cn-footer-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cn-sidebar.collapsed .cn-footer-container {
          flex-direction: column-reverse; /* Theme icon on top of User icon */
          align-items: center;
          gap: 12px;
        }

        .cn-account-block {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cn-theme-icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: none;
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: 0.2s ease;
          flex-shrink: 0;
        }

        .cn-theme-icon-btn:hover { 
            background: var(--color-hover-primary);
            color: white;
        }

        .cn-account-text {
          display: flex;
          flex-direction: column;
        }

        .cn-sidebar.collapsed .cn-account-text {
          display: none;
        }

        @media (max-width: 768px) {
          .cn-sidebar { position: fixed; left: -270px; top: 0; height: 100vh; }
          .cn-sidebar.mobile-open { left: 0; }
        }
      `}</style>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-[#1F2936] dark:text-slate-100 shadow-sm border border-[#E2E8F0] dark:border-slate-700"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-45 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`cn-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>

        {/* Header */}
        <div className="cn-sidebar-header">
          <div className="cn-logo-wrapper">
            <img src="/assets/logo-travelo.png" alt="Logo" />
          </div>
          <button className="cn-sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="cn-sidebar-content">
          <div className="cn-menu-heading">Menu</div>
          <ul className="cn-menu-list">
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path} className={`cn-menu-link ${isActive ? 'active' : ''}`} title={isCollapsed ? item.name : ''}>
                    <item.icon size={22} />
                    <span className="cn-menu-label font-bold text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {isAdmin && (
            <>
              <div className="my-4 border-t border-round border-gray-300 dark:border-slate-800 mx-2"></div>
              <div className="cn-menu-heading">System</div>
              <ul className="cn-menu-list">
                <li>
                  <Link href="/dashboard/team" className={`cn-menu-link ${pathname === '/admin/team' ? 'active' : ''}`} title={isCollapsed ? 'Team Members' : ''}>
                    <Users size={22} />
                    <span className="cn-menu-label font-bold text-sm">Team Members</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className={`cn-menu-link ${pathname === '/admin/settings' ? 'active' : ''}`} title={isCollapsed ? 'Agency Settings' : ''}>
                    <Settings size={22} />
                    <span className="cn-menu-label font-bold text-sm">Agency Settings</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Footer with Theme Toggle and User Account */}
        <div className="cn-sidebar-footer">
          <div className="cn-footer-container">

            {/* User Account Section */}
            <div className="cn-account-block">
              <div className="shrink-0 flex items-center justify-center">
              <UserButton 
  afterSignOutUrl="/" 
  appearance={{ 
    elements: { 
      // 👇 This centers the button itself
      rootBox: { 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      },
      avatarBox: { width: "32px", height: "32px" },
      userButtonPopoverCard: { pointerEvents: "auto" }
    } 
  }} 
/>
              </div>
              <div className="cn-account-text flex flex-col justify-center">
                <span
                  style={{ color: 'var(--color-text-sidebar-primary)' }}
                  className="text-[13px] font-black leading-none mb-0.5"
                >
                  My Account
                </span>
                <span className="text-[10px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-[0.08em] leading-none">
                  {role}
                </span>
              </div>
            </div>

            {/* Theme Toggle (Icon only) */}
            {mounted && (
              <button
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                className="cn-theme-icon-btn shadow-sm border border-gray-100 dark:border-slate-800"
                title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

          </div>
        </div>

      </aside>
    </>
  );
}