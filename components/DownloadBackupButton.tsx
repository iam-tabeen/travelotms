"use client";

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getBackupDownloadUrl } from '@/app/actions/backup-actions';

export default function DownloadBackupButton({ fileUrl }: { fileUrl: string }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const result = await getBackupDownloadUrl(fileUrl);
            
            if (result.success && result.url) {
                // Open the secure URL to trigger the download
                window.open(result.url, '_blank');
            } else {
                alert("Failed to fetch secure download link: " + result.error);
            }
        } catch (error) {
            console.error("Download error:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .vault-download-btn {
                    background-color: rgba(59, 130, 246, 0.1) !important;
                    border: 1px solid rgba(59, 130, 246, 0.2) !important;
                    color: #60A5FA !important;
                }
                html.dark .vault-download-btn:hover {
                    background-color: rgba(59, 130, 246, 0.2) !important;
                    border-color: rgba(59, 130, 246, 0.4) !important;
                }
            `}</style>

            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="vault-download-btn inline-flex items-center gap-2 text-axius-primary font-bold text-xs transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
            >
                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {isDownloading ? 'Securely Fetching...' : 'Download CSV'}
            </button>
        </>
    );
}