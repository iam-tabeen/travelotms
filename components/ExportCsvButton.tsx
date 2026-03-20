"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Megaphone, Database, Lock } from 'lucide-react';

export default function ExportCsvButton({ leads, isPro, activeTab }: { leads: any[], isPro: boolean, activeTab: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return '""';
        if (val instanceof Date) return `"${val.toLocaleDateString()}"`;
        if (typeof val === 'object') return `""`; // Skip nested objects to keep CSV clean
        return `"${String(val).replace(/"/g, '""')}"`; // Escape quotes safely
    };

    const handleExport = (type: 'marketing' | 'storage') => {
        if (!isPro) {
            alert("🚀 Upgrade to PRO to export your data!");
            setIsOpen(false);
            return;
        }

        if (leads.length === 0) {
            alert("No data available to export.");
            setIsOpen(false);
            return;
        }

        let headers: string[] = [];
        let rows: string[][] = [];

        if (type === 'marketing') {
            headers = ['Name', 'Email', 'Phone'];
            rows = leads.map(lead => {
                const name = activeTab === 'regular' ? (lead.customerName || lead.name) : (lead.clientName || lead.name);
                const email = activeTab === 'regular' ? (lead.customerEmail || lead.email) : (lead.clientEmail || lead.email);
                const phone = activeTab === 'regular' ? (lead.customerPhone || lead.phone) : (lead.clientPhone || lead.phone);
                return [formatValue(name), formatValue(email), formatValue(phone)];
            });
        } else {
            const firstLead = leads[0];
            const dynamicHeaders = Object.keys(firstLead).filter(k => typeof firstLead[k] !== 'object' || firstLead[k] instanceof Date);
            
            headers = [...dynamicHeaders];
            if (activeTab === 'regular') headers.push('tourName'); 

            rows = leads.map(lead => {
                const rowData = dynamicHeaders.map(key => formatValue(lead[key]));
                if (activeTab === 'regular') {
                    rowData.push(formatValue(lead.tour?.title || ''));
                }
                return rowData;
            });
        }

        // Trigger Download
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Leads_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                
                /* Trigger Button Overrides */
                html.dark .export-btn-pro {
                    background-color: #334155 !important;
                    border-color: transparent !important;
                    color: #FFFFFF !important;
                }
                html.dark .export-btn-pro:hover {
                    background-color: #475569 !important;
                }
                
                html.dark .export-btn-free {
                    background-color: #1E293B !important;
                    border-color: #334155 !important;
                    color: #94A3B8 !important;
                }
                html.dark .export-btn-free:hover {
                    background-color: #334155 !important;
                    color: #FFFFFF !important;
                }

                /* Dropdown Menu Overrides */
                html.dark .export-dropdown {
                    background-color: #1E293B !important;
                    border-color: #334155 !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
                }
                html.dark .export-item {
                    border-bottom-color: #334155 !important;
                }
                html.dark .export-item:hover {
                    background-color: rgba(59, 130, 246, 0.1) !important;
                }
                
                html.dark .export-text-primary { color: #FFFFFF !important; }
                html.dark .export-text-secondary { color: #94A3B8 !important; }
                html.dark .export-icon-muted { color: #64748B !important; }
            `}</style>

            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border cursor-pointer ${
                        isPro 
                        ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900 export-btn-pro' 
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 export-btn-free'
                    }`}
                >
                    <Download size={16} />
                    {isPro ? 'Export Leads' : 'Export Leads (PRO)'}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border-2 border-gray-300 rounded-xl shadow-xl z-50 font-sans overflow-hidden transition-colors export-dropdown">
                        <button 
                            onClick={() => handleExport('marketing')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer export-item"
                        >
                            <Megaphone size={16} className={isPro ? "text-blue-500" : "text-gray-400 export-icon-muted"} />
                            <div>
                                <div className={`text-sm font-bold ${isPro ? 'text-gray-900 export-text-primary' : 'text-gray-500 export-text-secondary'}`}>Export for Marketing</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider export-text-secondary">Name, Email, Phone</div>
                            </div>
                            {!isPro && <Lock size={12} className="ml-auto text-gray-400 export-icon-muted" />}
                        </button>
                        
                        <button 
                            onClick={() => handleExport('storage')}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer export-item"
                            style={{ borderBottom: 'none' }}
                        >
                            <Database size={16} className={isPro ? "text-green-500" : "text-gray-400 export-icon-muted"} />
                            <div>
                                <div className={`text-sm font-bold ${isPro ? 'text-gray-900 export-text-primary' : 'text-gray-500 export-text-secondary'}`}>Export for Storage</div>
                                <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider export-text-secondary">All Database Columns</div>
                            </div>
                            {!isPro && <Lock size={12} className="ml-auto text-gray-400 export-icon-muted" />}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}