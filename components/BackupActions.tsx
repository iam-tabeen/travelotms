"use client";

import { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import { createBackup } from '@/app/actions/backup-actions';

export default function BackupActions({ isPro }: { isPro: boolean }) {
    const [isPending, setIsPending] = useState(false);

    const handleBackup = async () => {
        if (!isPro) {
            alert("🚀 Upgrade to PRO to generate manual backups!");
            return;
        }
        
        setIsPending(true);
        const result = await createBackup('MANUAL');
        
        if (result.success) {
            alert("✅ Backup created successfully! It is now stored in your vault.");
        } else {
            alert("❌ Error: " + result?.error);
        }
        setIsPending(false);
    };

    return (
        <button 
            onClick={handleBackup}
            disabled={!isPro || isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                isPro 
                ? 'bg-gray-700 text-white hover:bg-gray-800' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            style={{cursor:"pointer"}}
        >
            {isPending ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <Database size={18} />
            )}
            {isPro ? (isPending ? 'Generating...' : 'Generate Manual Backup') : 'Manual Backup (PRO)'}
        </button>
    );
}