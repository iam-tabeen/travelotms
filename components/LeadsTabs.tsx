"use client";

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LeadsTabs({ 
    regularCount, 
    customCount 
}: { 
    regularCount: number, 
    customCount: number 
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'regular';
    
    // This hook lets us track when Next.js is fetching the new page data!
    const [isPending, startTransition] = useTransition();

    const switchTab = (tab: string) => {
        startTransition(() => {
            router.push(`?tab=${tab}`);
        });
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .tab-container {
                    border-bottom-color: #334155 !important;
                }
                
                html.dark .tab-btn-active {
                    background-color: #1E293B !important; 
                    color: #FFFFFF !important;
                    border-color: #334155 !important;
                    /* Pushes the background down 1px to seamlessly hide the container's bottom border */
                    margin-bottom: -1px !important;
                    border-bottom-color: #1E293B !important; 
                }
                
                html.dark .tab-btn-inactive {
                    color: #94A3B8 !important;
                    margin-bottom: -1px !important;
                    border-bottom: 1px solid transparent !important;
                }
                html.dark .tab-btn-inactive:hover {
                    color: #E2E8F0 !important;
                    background-color: rgba(30, 41, 59, 0.4) !important;
                }
                
                html.dark .lead-loader-text { 
                    color: #60A5FA !important; 
                }
            `}</style>
            
            <div className="flex gap-4 border-b border-gray-200 relative tab-container transition-colors">
                <button 
                    onClick={() => switchTab('regular')}
                    className={`py-3 px-6 text-sm font-black tracking-widest uppercase transition-colors rounded-t-xl cursor-pointer ${
                        activeTab === 'regular' 
                        ? 'bg-white text-axius-primary border-t border-l border-r border-gray-200 tab-btn-active' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 tab-btn-inactive'
                    }`}
                >
                    Predefined Tours ({regularCount})
                </button>
                
                <button 
                    onClick={() => switchTab('custom')}
                    className={`py-3 px-6 text-sm font-black tracking-widest uppercase transition-colors rounded-t-xl cursor-pointer ${
                        activeTab === 'custom' 
                        ? 'bg-white text-axius-primary border-t border-l border-r border-gray-200 tab-btn-active' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 tab-btn-inactive'
                    }`}
                >
                    Custom Requests ({customCount})
                </button>

                {/* THE LOADER: Only shows up when the server is fetching data */}
                {isPending && (
                    <div className="absolute right-4 top-3 flex items-center gap-2 text-axius-primary text-sm font-bold animate-pulse lead-loader-text">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Fetching Leads...
                    </div>
                )}
            </div>
        </>
    );
}