"use client";

import { useTransition } from 'react';
import { togglePromoStatus } from '@/app/actions/promos';

export default function TogglePromoButton({ id, isActive }: { id: string, isActive: boolean }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => { togglePromoStatus(id, isActive) })}
            disabled={isPending}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isPending ? 'Updating...' : (isActive ? 'Active' : 'Disabled')}
        </button>
    );
}