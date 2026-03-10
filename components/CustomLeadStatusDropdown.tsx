"use client";

import { useTransition } from 'react';
import { updateCustomLeadStatus } from '@/app/actions/customTour';

export default function CustomLeadStatusDropdown({ 
    leadId, 
    currentStatus 
}: { 
    leadId: string, 
    currentStatus: string 
}) {
    const [isPending, startTransition] = useTransition();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING': 
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        startTransition(async () => {
            await updateCustomLeadStatus(leadId, newStatus);
        });
    };

    return (
        <div className="relative inline-block">
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isPending}
                className={`appearance-none outline-none cursor-pointer text-[10px] font-black uppercase tracking-widest px-3 py-1.5 pr-8 rounded-full border transition-all ${getStatusColor(currentStatus)} ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
            >
                <option value="PENDING">PENDING</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="REJECTED">REJECTED</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg className="fill-current h-3 w-3 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
}