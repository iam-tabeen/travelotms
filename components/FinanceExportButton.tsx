"use client";

import { useState, useRef, useEffect } from 'react';
import { Download, Calendar, Lock, FileSpreadsheet } from 'lucide-react';

export default function FinanceExportButton({ transactions, isPro }: { transactions: any[], isPro: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
        if (typeof val === 'object') return `""`; 
        return `"${String(val).replace(/"/g, '""')}"`; 
    };

    const handleExport = () => {
        if (!isPro) {
            alert("🚀 Upgrade to PRO to export financial records!");
            setIsOpen(false);
            return;
        }

        if (!startDate || !endDate) {
            alert("Please select both a start and end date.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day

        // Filter transactions based on selected dates using the hidden raw date
        const filteredData = transactions.filter(t => {
            const tDate = new Date(t._rawDate); 
            return tDate >= start && tDate <= end;
        });

        if (filteredData.length === 0) {
            alert("No financial records found in this date range.");
            return;
        }

        // --- CALCULATE SUMMARY METRICS ---
        const totalRevenue = filteredData.reduce((sum, row) => sum + (Number(row.Amount) || 0), 0);
        const totalTransactions = filteredData.length;

        // --- BUILD THE CSV STRUCTURE ---
        let csvLines: string[] = [];

        // 1. Report Header Section
        csvLines.push(`"FINANCIAL LEDGER REPORT"`);
        csvLines.push(`"Reporting Period:","${startDate} to ${endDate}"`);
        csvLines.push(`"Generated On:","${new Date().toLocaleDateString()}"`);
        csvLines.push(""); // Empty line

        // 2. Summary Dashboard Section
        csvLines.push(`"--- SUMMARY DASHBOARD ---"`);
        csvLines.push(`"Total Revenue Collected:","Rs. ${totalRevenue.toLocaleString()}"`);
        csvLines.push(`"Total Transactions:","${totalTransactions}"`);
        csvLines.push(""); // Empty line
        csvLines.push(""); // Empty line

        // 3. Transactions Table Section
        csvLines.push(`"--- TRANSACTION DETAILS ---"`);
        
        const firstRecord = filteredData[0];
        // Get headers (Ignoring the hidden _rawDate column)
        const headers = Object.keys(firstRecord).filter(k => k !== '_rawDate' && (typeof firstRecord[k] !== 'object' || firstRecord[k] instanceof Date));
        
        // Add headers row
        csvLines.push(headers.map(h => `"${h}"`).join(","));

        // Add data rows
        filteredData.forEach(record => {
            const row = headers.map(key => formatValue(record[key]));
            csvLines.push(row.join(","));
        });

        // Trigger Download
        const csvContent = csvLines.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Financial_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .fin-export-btn-pro { background-color: #334155 !important; border-color: transparent !important; color: #FFFFFF !important; }
                html.dark .fin-export-btn-pro:hover { background-color: #475569 !important; }
                
                html.dark .fin-export-btn-free { background-color: #1E293B !important; border-color: #334155 !important; color: #94A3B8 !important; }
                html.dark .fin-export-btn-free:hover { background-color: #334155 !important; color: #FFFFFF !important; }

                html.dark .fin-export-dropdown { background-color: #1E293B !important; border-color: #334155 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important; }
                html.dark .fin-export-input { background-color: #0F172A !important; border-color: #334155 !important; color: white !important; color-scheme: dark; }
                html.dark .fin-export-input:focus { border-color: #3B82F6 !important; }
                
                html.dark .fin-export-text-primary { color: #FFFFFF !important; }
                html.dark .fin-export-text-secondary { color: #94A3B8 !important; }
                html.dark .fin-export-divider { border-color: #334155 !important; }
            `}</style>

            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border cursor-pointer ${
                        isPro 
                        ? 'bg-[#2563EB] hover:bg-blue-700 text-white border-[#2563EB] fin-export-btn-pro' 
                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 fin-export-btn-free'
                    }`}
                >
                    <FileSpreadsheet size={16} />
                    {isPro ? 'Export Ledger' : 'Export Ledger (PRO)'}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-5 font-sans transition-colors fin-export-dropdown">
                        
                        {!isPro ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Lock className="text-gray-400 fin-export-text-secondary" size={20} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 fin-export-text-primary mb-1">PRO Feature</h3>
                                <p className="text-xs text-gray-500 fin-export-text-secondary leading-relaxed">
                                    Exporting financial ledgers for your accountant is exclusive to PRO members.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-[#2563EB]" />
                                    <h3 className="text-sm font-black text-gray-900 fin-export-text-primary uppercase tracking-widest">Select Timeline</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 fin-export-text-secondary">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors fin-export-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 fin-export-text-secondary">End Date</label>
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2563EB] transition-colors fin-export-input"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-gray-100 fin-export-divider">
                                    <button 
                                        onClick={handleExport}
                                        className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-widest transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-md active:scale-95"
                                    >
                                        <Download size={14} /> Download CSV
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
