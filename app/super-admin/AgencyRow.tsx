'use client';

import { useState, useTransition } from 'react';
import { Power, TrendingUp, Users, Key, Copy, Check } from 'lucide-react';
import { toggleAgencyAccess, updateAgencyTier } from './actions';
import { generateApiKey } from '@/app/actions/api-key-actions';

export default function AgencyRow({ agency }: { agency: any }) {
    const [isPending, startTransition] = useTransition();
    
    // New states for the API Key UI
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleToggleAccess = () => {
        startTransition(() => {
            toggleAgencyAccess(agency.id, agency.isActive);
        });
    };

    const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        startTransition(() => {
            updateAgencyTier(agency.id, e.target.value);
        });
    };

    // New handler to generate the key
    const handleGenerateKey = async () => {
        setIsGenerating(true);
        const res = await generateApiKey(agency.id);
        if (!res.success) {
            alert(res.message); // Fallback error handling
        }
        setIsGenerating(false);
    };

    // New handler to copy the key
    const handleCopy = () => {
        if (agency.apiKey?.key) {
            navigator.clipboard.writeText(agency.apiKey.key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset checkmark after 2s
        }
    };

    return (
        <tr className={`transition-colors ${agency.isActive ? 'hover:bg-gray-700/20' : 'bg-red-900/10 opacity-75'}`}>
            <td className="p-5">
                <div className="font-bold text-white">{agency.companyName}</div>
                <div className="text-xs text-gray-400 mt-1">{agency.adminEmail}</div>
                <div className="text-[10px] text-gray-500 mt-1 font-mono">ID: {agency.id.split('-')[0]}...</div>
            </td>
            
            <td className="p-5">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                        <TrendingUp size={14} className="text-blue-400"/> {agency._count.tours} Tours
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
                        <Users size={14} className="text-green-400"/> {agency._count.bookings} Leads
                    </div>
                </div>
            </td>
            
            <td className="p-5">
                <select 
                    value={agency.planTier}
                    onChange={handleTierChange}
                    disabled={isPending}
                    className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-md border outline-none cursor-pointer appearance-none ${
                        agency.planTier === 'PRO' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-gray-800 text-gray-300 border-gray-600'
                    }`}
                >
                    <option value="BASIC">BASIC</option>
                    <option value="PRO">PRO</option>
                    {/* <option value="ENTERPRISE">ENTERPRISE</option> */}
                </select>
            </td>

            {/* NEW: API KEY COLUMN */}
            <td className="p-5">
                {agency.apiKey ? (
                    <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2 border border-gray-700 w-fit">
                        <span className="text-xs font-mono text-gray-400 truncate w-32" title={agency.apiKey.key}>
                            {agency.apiKey.key.slice(0, 15)}...
                        </span>
                        <button 
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md"
                            title="Copy full key"
                        >
                            {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleGenerateKey}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs font-bold text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Key size={14} />
                        {isGenerating ? 'Generating...' : 'Generate Key'}
                    </button>
                )}
            </td>
            
            <td className="p-5 text-right">
                <button 
                    onClick={handleToggleAccess}
                    disabled={isPending}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                        agency.isActive 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Power size={14} /> 
                    {agency.isActive ? 'Active' : 'Suspended'}
                </button>
            </td>
        </tr>
    );
}