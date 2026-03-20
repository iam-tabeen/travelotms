"use client";

import { useState } from 'react';
import { Eye, X, Calendar, MapPin, Users, Wallet, FileText, Download, Lock } from 'lucide-react';
import BookingStatusDropdown from '@/components/BookingStatusDropdown';
import { generateTourPDF } from '@/lib/generatePDF';
import PaymentLedger from '@/components/PaymentLedger';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function RegularLeadRow({ booking, agencyName, isPro, canManage, allowPartialPayments }: { booking: any, agencyName: string, isPro: boolean, canManage: boolean, allowPartialPayments: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);  
    const [invoiceType, setInvoiceType] = useState<'UNPAID' | 'PAID'>('UNPAID');
    const searchParams = useSearchParams();
    
    useEffect(() => {
        // If the URL has ?open=ID and it matches this specific booking, open the modal!
        if (searchParams.get('open') === booking.id) {
            setIsModalOpen(true); // Fixed the function name here!
        }
    }, [searchParams, booking.id]);

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .lead-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .lead-hover-row:hover { background-color: rgba(30, 41, 59, 0.5) !important; }
                
                html.dark .lead-text-primary { color: #FFFFFF !important; }
                html.dark .lead-text-secondary { color: #94A3B8 !important; }
                html.dark .lead-text-blue { color: #60A5FA !important; }
                html.dark .lead-text-green { color: #4ADE80 !important; }
                
                html.dark .lead-bg-blue { background-color: rgba(59, 130, 246, 0.1) !important; border-color: rgba(59, 130, 246, 0.2) !important; color: #60A5FA !important; }
                
                html.dark .lead-btn { background-color: #334155 !important; color: #E2E8F0 !important; border-color: transparent !important; }
                html.dark .lead-btn:hover { background-color: #475569 !important; }

                /* Status Badge Overrides */
                html.dark .fin-badge-green { background-color: rgba(16, 185, 129, 0.1) !important; color: #34D399 !important; border-color: rgba(16, 185, 129, 0.2) !important; }
                html.dark .fin-badge-gray { background-color: rgba(239, 68, 68, 0.1) !important; color: #F87171 !important; border-color: rgba(239, 68, 68, 0.2) !important; }
                html.dark .fin-badge-orange { background-color: rgba(245, 158, 11, 0.1) !important; color: #FBBF24 !important; border-color: rgba(245, 158, 11, 0.2) !important; }

                /* 🛡️ MODAL POLYFILLS 🛡️ */
                html.dark .lead-modal-bg { background-color: #0F172A !important; border-color: #1E293B !important; }
                html.dark .lead-modal-header { background-color: #0F172A !important; border-bottom-color: #1E293B !important; }
                html.dark .lead-modal-muted { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .lead-modal-input { background-color: #1E293B !important; border-color: #334155 !important; color: white !important; }
                
                html.dark .lead-modal-close { background-color: #1E293B !important; color: #94A3B8 !important; }
                html.dark .lead-modal-close:hover { background-color: rgba(239,68,68,0.2) !important; color: #F87171 !important; }
                
                html.dark .lead-modal-yellow { background-color: rgba(245, 158, 11, 0.05) !important; border-color: rgba(245, 158, 11, 0.1) !important; }
                html.dark .lead-modal-yellow-text { color: #FBBF24 !important; }
            `}</style>

            <tr className="bg-white hover:bg-gray-50 transition-colors lead-bg-card lead-hover-row border-b border-gray-100">
                
                {/* 1. Date */}
                <td className="p-6 text-sm font-bold text-gray-500 lead-text-secondary">
                    {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                
                {/* 2. Client */}
                <td className="p-6">
                    <div className="font-black text-axius-secondary lead-text-primary">{booking.customerName}</div>
                    <div className="text-sm text-axius-primary font-bold mt-1 flex gap-2 items-center lead-text-blue" >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} className="fill-current"><path d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"/></svg> 
                        {booking.customerPhone}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2 items-center lead-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} className="fill-current"><path d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"/></svg> 
                        {booking.customerEmail}
                    </div>
                </td>
                
                {/* 3. Expedition & Add-ons */}
                <td className="p-6 text-sm font-bold text-axius-secondary lead-text-primary" >
                    <div>{booking.tour?.title || "Deleted Tour"}</div>
                    {booking.selectedAddOns && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {booking.selectedAddOns.split(', ').map((addon: string, i: number) => (
                                <span key={i} className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-blue-100 tracking-tighter lead-bg-blue">
                                    + {addon}
                                </span>
                            ))}
                        </div>
                    )}
                </td>
                
                {/* 4. Pax & Date */}
                <td className="p-6">
                    <div className="text-sm font-bold text-gray-700 flex gap-2 items-center lead-text-primary">
                        <Users size={16} className="text-gray-400 lead-text-secondary" /> 
                        {booking.numTravelers} Travelers
                    </div>
                    <div className="text-xs font-bold text-gray-500 mt-1 flex gap-2 items-center lead-text-secondary">
                        <Calendar size={14} className="text-[#2563EB] lead-text-blue" /> 
                        {new Date(booking.travelDate).toLocaleDateString()}
                    </div>
                </td>
                
                {/* 5. Value */}
                <td className="p-6 text-lg font-black text-green-600 lead-text-green">
                    Rs. {booking.totalPrice.toLocaleString()}
                </td>

                {/* 6. Status & View Button */}
                <td className="p-6">
                    <div className="flex items-center gap-3">
                        {canManage ? (
                            <BookingStatusDropdown bookingId={booking.id} currentStatus={booking.status} />
                        ) : (
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border border-green-100 fin-badge-green' :
                                booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100 fin-badge-gray' :
                                'bg-yellow-50 text-yellow-600 border border-yellow-100 fin-badge-orange'
                            }`}>
                                {booking.status}
                            </span>
                        )}

                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer lead-btn"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                    </div>

                    {/* MODAL SECTION - Now uses guaranteed polyfill classes */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn cursor-default" style={{ textAlign: 'left' }}>
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-transparent transition-colors lead-modal-bg">
                                
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 transition-colors lead-modal-header">
                                    <div>
                                        <h2 className="text-2xl font-black text-axius-secondary lead-text-primary">Booking Details</h2>
                                        <p className="text-sm font-medium text-gray-500 mt-1 lead-text-secondary">Submitted on {new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        
                                        <select 
                                            value={invoiceType}
                                            onChange={(e) => setInvoiceType(e.target.value as 'UNPAID' | 'PAID')}
                                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-all cursor-pointer lead-modal-input"
                                        >
                                            <option value="UNPAID">Unpaid Invoice</option>
                                            <option value="PAID">Paid Receipt</option>
                                        </select>

                                        <button 
                                            onClick={() => generateTourPDF(booking, agencyName, invoiceType, isPro)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md active:scale-95 cursor-pointer">
                                            <Download size={14} />
                                            <span style={{fontFamily:"var(--font-poppins)", fontWeight:"600"}}>
                                                {isPro ? 'Generate PDF' : 'Generate (BASIC)'}
                                            </span>
                                        </button>

                                        <button 
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer lead-modal-close"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-6 transition-colors lead-modal-muted">
                                        <div className="flex-1">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 lead-text-secondary">Client Profile</h3>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Full Name</p>
                                                    <p className="font-bold text-axius-secondary lead-text-primary">{booking.customerName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Phone</p>
                                                    <p className="font-bold text-axius-primary lead-text-blue">{booking.customerPhone}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Email</p>
                                                    <p className="font-bold text-gray-700 lead-text-primary">{booking.customerEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sm:text-right bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-colors lead-modal-muted">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 lead-text-secondary">Current Status</h3>
                                            <span className={`px-4 py-2 block rounded-lg text-xs font-black uppercase tracking-widest ${
                                                booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border border-green-100 fin-badge-green' :
                                                booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100 fin-badge-gray' :
                                                'bg-yellow-50 text-yellow-600 border border-yellow-100 fin-badge-orange'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-6 transition-colors lead-text-secondary">Expedition Details</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="col-span-2 md:col-span-4 bg-[#FBFDFF] border border-blue-50 rounded-xl p-4 transition-colors lead-modal-muted">
                                                <div className="flex items-center gap-2 text-axius-primary mb-1 lead-text-blue"><MapPin size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Tour Name</span></div>
                                                <p className="text-lg font-black text-axius-secondary lead-text-primary">{booking.tour?.title || "Deleted Tour"}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Calendar size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Travel Date</span></div>
                                                <p className="text-sm font-bold text-axius-secondary lead-text-primary">{new Date(booking.travelDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Users size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Pax</span></div>
                                                <p className="text-sm font-bold text-axius-secondary lead-text-primary">{booking.numTravelers} Travelers</p>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Wallet size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Total Value</span></div>
                                                <p className="text-xl font-black text-green-600 lead-text-green">Rs. {booking.totalPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === 'CONFIRMED' && (
                                        <PaymentLedger 
                                            bookingId={booking.id}
                                            totalPrice={booking.totalPrice}
                                            amountPaid={booking.amountPaid || 0}
                                            payments={booking.payments || []}
                                            allowPartialPayments={allowPartialPayments}
                                            canManage={canManage}
                                        />
                                    )}
                                    
                                    <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 transition-colors lead-modal-yellow">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-800 mb-3 flex items-center gap-2 lead-modal-yellow-text">
                                            <FileText size={16}/> Special Notes & Requests
                                        </h3>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap lead-text-primary">
                                            {booking.specialNotes || <span className="italic text-gray-400 lead-text-secondary">No special notes provided.</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </td>
            </tr>
        </>
    );
}