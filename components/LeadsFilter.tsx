"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function LeadsFilter({ activeTab }: { activeTab: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get('search') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentStatus = searchParams.get('status') || 'ALL'; 

    const [search, setSearch] = useState(currentSearch);

    const updateParams = (newSearch: string, newSort: string, newStatus: string) => {
        const params = new URLSearchParams();
        if (activeTab !== 'regular') params.set('tab', activeTab);
        if (newSearch) params.set('search', newSearch);
        if (newSort !== 'newest') params.set('sort', newSort);
        if (newStatus !== 'ALL') params.set('status', newStatus); 
        
        startTransition(() => {
            router.push(`/admin/leads?${params.toString()}`);
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams(search, currentSort, currentStatus);
    };

    const showSearchButton = search !== currentSearch;

    // Streamlined filters
    const quickFilters = [
        { label: "All Leads", value: "ALL", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width={"16px"}><path fill="currentColor" d="M320 192a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm0-176a112 112 0 1 1 0 224 112 112 0 1 1 0-224zM296 336c-57.4 0-104 46.6-104 104l0 16c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-16c0-83.9 68.1-152 152-152l48 0c83.9 0 152 68.1 152 152l0 16c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-16c0-57.4-46.6-104-104-104l-48 0zm135.4-93.2c11.7-11.3 21.6-24.4 29.4-38.8 5.9 2.6 12.4 4 19.2 4 26.5 0 48-21.5 48-48s-21.5-48-48-48l-.8 0c-1.6-16.6-5.8-32.4-12.1-47.1 4.2-.6 8.6-.9 12.9-.9 53 0 96 43 96 96s-43 96-96 96c-17.7 0-34.3-4.8-48.6-13.2zM160 64c4.4 0 8.7 .3 12.9 .9-6.3 14.7-10.5 30.6-12.1 47.1l-.8 0c-26.5 0-48 21.5-48 48s21.5 48 48 48c6.8 0 13.3-1.4 19.2-4 7.8 14.4 17.7 27.5 29.4 38.8-14.2 8.4-30.8 13.2-48.6 13.2-53 0-96-43-96-96s43-96 96-96zM149.3 304c-15.1 16.3-27.5 35-36.5 55.6-38 15.5-64.8 52.8-64.8 96.4 0 13.3-10.7 24-24 24S0 469.3 0 456c0-83.1 66.6-150.6 149.3-152zm377.9 55.6c-9-20.6-21.5-39.4-36.5-55.6 82.7 1.4 149.3 68.9 149.3 152 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-43.6-26.8-80.9-64.8-96.4z"/></svg> },
        { label: "Action Needed", value: "PENDING", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"}><path fill="currentColor" d="M464 256a208 208 0 1 1 -416 0 208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>  },
        { label: "Confirmed", value: "CONFIRMED", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"}><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/></svg> },
        { label: "Cancelled", value: "CANCELLED", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"}><path fill="currentColor" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM202.6 152.8c-8.4-10.3-23.5-11.8-33.8-3.4s-11.8 23.5-3.4 33.8L225 256 165.4 328.8c-8.4 10.3-6.9 25.4 3.4 33.8s25.4 6.9 33.8-3.4l53.4-65.3 53.4 65.3c8.4 10.3 23.5 11.8 33.8 3.4s11.8-23.5 3.4-33.8L287 256 346.6 183.2c8.4-10.3 6.9-25.4-3.4-33.8s-25.4-6.9-33.8 3.4l-53.4 65.3-53.4-65.3z"/></svg> },
    ];

    return (
        <div className="flex flex-col gap-3 w-full xl:w-auto">
            
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .filter-input { background-color: #1E293B !important; border-color: #334155 !important; color: white !important; }
                html.dark .filter-input::placeholder { color: #64748B !important; }
                html.dark .filter-input:focus { border-color: #3B82F6 !important; }
                
                html.dark .filter-icon-muted { color: #64748B !important; }
                html.dark .filter-icon-blue { color: #60A5FA !important; }
                html.dark .filter-loader { color: #60A5FA !important; }

                /* Quick Filter Pills - Sleeker Version */
                html.dark .pill-inactive { background-color: #0F172A !important; border-color: #334155 !important; color: #94A3B8 !important; }
                html.dark .pill-inactive:hover { background-color: #1E293B !important; color: #E2E8F0 !important; }
                
                html.dark .pill-active { background-color: rgba(59, 130, 246, 0.15) !important; border-color: rgba(59, 130, 246, 0.4) !important; color: #60A5FA !important; }
            `}</style>

            {/* QUICK FILTERS ROW - Optimized Size */}
            <div className="flex flex-wrap gap-2 w-full">
                {quickFilters.map((filter) => {
                    const isActive = currentStatus === filter.value;
                    return (
                        <button
                            key={filter.value}
                            onClick={() => updateParams(search, currentSort, filter.value)}
                            disabled={isPending}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                isActive 
                                ? 'bg-blue-50 border-blue-300 text-blue-700 pill-active' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 pill-inactive'
                            } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <span className="text-[10px]">{filter.icon}</span> {filter.label}
                        </button>
                    );
                })}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                {/* SEARCH BAR */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-80">
                    <Search size={18} className="absolute left-4 text-gray-400 pointer-events-none filter-icon-muted" />
                    <input 
                        type="text" 
                        placeholder="Search names, emails..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all filter-input"
                    />
                    <div className="absolute right-2 flex items-center">
                        {isPending ? (
                            <div className="pr-2">
                                <Loader2 size={16} className="animate-spin text-[#2563EB] filter-loader" />
                            </div>
                        ) : showSearchButton ? (
                            <button type="submit" className="bg-[#2563EB] text-white text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                SEARCH
                            </button>
                        ) : null}
                    </div>
                </form>

                {/* SORTING DROPDOWN */}
                <div className="relative flex items-center w-full sm:w-56">
                    <ArrowUpDown size={16} className="absolute left-4 text-[#2563EB] pointer-events-none filter-icon-blue" />
                    <select 
                        value={currentSort}
                        onChange={(e) => updateParams(search, e.target.value, currentStatus)}
                        disabled={isPending}
                        className={`w-full pl-12 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all cursor-pointer filter-input ${isPending ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        {activeTab === 'regular' && (
                            <>
                                <option value="price-desc">Highest Value</option>
                                <option value="price-asc">Lowest Value</option>
                            </>
                        )}
                    </select>
                    <div className="absolute right-4 pointer-events-none text-gray-400 filter-icon-muted">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            
        </div>
    );
}