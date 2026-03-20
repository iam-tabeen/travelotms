"use client";

import { useState } from 'react';
import { createPromoCode } from '@/app/actions/promos';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CreatePromoForm({ tenantId }: { tenantId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            await createPromoCode(tenantId, formData);
            toast.success("Promo code created successfully!");
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to create promo code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .promo-modal-card { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                }
                html.dark .promo-modal-header { 
                    border-bottom-color: #334155 !important; 
                }
                html.dark .promo-input { 
                    background-color: #0F172A !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                html.dark .promo-input:focus { 
                    border-color: #3B82F6 !important; 
                }
                html.dark .promo-label { 
                    color: #94A3B8 !important; 
                }
                html.dark .promo-text-primary { 
                    color: #FFFFFF !important; 
                }
            `}</style>

            <button 
                onClick={() => setIsOpen(true)}
                /* Changed bg-blue-600 to ensure it shows in Light Theme, and used dark:bg-blue-500 for Dark Theme */
                className="bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center gap-2 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ fontFamily: 'var(--font-poppins)', fontWeight: "600" }}
            >
                <Plus size={18} /> New Promo Code
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-colors promo-modal-card border border-transparent">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center promo-modal-header">
                            <h2 className="text-lg font-black text-axius-secondary promo-text-primary">Create Promo Code</h2>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1 promo-label">Code Name</label>
                                <input 
                                    type="text" 
                                    name="code" 
                                    placeholder="e.g. SUMMER20" 
                                    required 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-black text-lg uppercase transition-colors promo-input" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1 promo-label">Type</label>
                                    <select 
                                        name="discountType" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-gray-700 transition-colors promo-input"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (Rs.)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1 promo-label">Value</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="discountValue" 
                                        placeholder="10" 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold transition-colors promo-input" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1 promo-label">Usage Limit</label>
                                    <input 
                                        type="number" 
                                        name="usageLimit" 
                                        placeholder="e.g. 50" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold transition-colors promo-input" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block ml-1 promo-label">Expiry</label>
                                    <input 
                                        type="date" 
                                        name="validUntil" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-gray-600 transition-colors promo-input" 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {isSubmitting ? 'Creating...' : 'Activate Promo Code'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}