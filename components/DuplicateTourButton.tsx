"use client";

import { useTransition } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { duplicateTour } from '@/app/actions/tourActions'; 
import { useRouter } from 'next/navigation';

export default function DuplicateTourButton({ tourId }: { tourId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDuplicate = () => {
        startTransition(async () => {
            const result = await duplicateTour(tourId);
            
            if (result.success) {
                // Refresh the router to show the new tour in the list immediately
                router.refresh(); 
            } else {
                alert("Failed to duplicate tour. Please try again.");
            }
        });
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .dup-btn { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                    color: #94A3B8 !important; 
                }
                html.dark .dup-btn:hover { 
                    background-color: #334155 !important; 
                    color: #E2E8F0 !important; 
                }
            `}</style>

            
                
            
            <button onClick={handleDuplicate}  disabled={isPending} title="Duplicate Tour" className="icon-btn" >
            
            {isPending ? (
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                ) : (
                    <Copy size={16} />
                )}
                </button>
        </>
    );
}