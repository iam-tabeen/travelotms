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
        <div className="flex gap-4 border-b border-gray-200 pb-px relative">
            <button 
                onClick={() => switchTab('regular')}
                className={`py-3 px-6 text-sm font-black tracking-widest uppercase transition-colors rounded-t-xl ${activeTab === 'regular' ? 'bg-white text-axius-primary border-t border-l border-r border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Predefined Tours ({regularCount})
            </button>
            <button 
                onClick={() => switchTab('custom')}
                className={`py-3 px-6 text-sm font-black tracking-widest uppercase transition-colors rounded-t-xl ${activeTab === 'custom' ? 'bg-white text-axius-primary border-t border-l border-r border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Custom Requests ({customCount})
            </button>

            {/* THE LOADER: Only shows up when the server is fetching data */}
            {isPending && (
                <div className="absolute right-4 top-3 flex items-center gap-2 text-axius-primary text-sm font-bold animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Fetching Leads...
                </div>
            )}
        </div>
    );
}