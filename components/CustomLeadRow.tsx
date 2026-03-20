"use client";

import { useState } from 'react';
import { Eye, X, Calendar, MapPin, Users, Wallet, Home, FileText } from 'lucide-react';
import CustomLeadStatusDropdown from '@/components/CustomLeadStatusDropdown';

export default function CustomLeadRow({ lead, canManage }: { lead: any, canManage: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                
                html.dark .lead-modal-close { background-color: #1E293B !important; color: #94A3B8 !important; }
                html.dark .lead-modal-close:hover { background-color: rgba(239,68,68,0.2) !important; color: #F87171 !important; }
                
                html.dark .lead-modal-yellow { background-color: rgba(245, 158, 11, 0.05) !important; border-color: rgba(245, 158, 11, 0.1) !important; }
                html.dark .lead-modal-yellow-text { color: #FBBF24 !important; }

                html.dark .lead-modal-tag-blue { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; }
                html.dark .lead-modal-tag-gray { background-color: #1E293B !important; color: #CBD5E1 !important; }
            `}</style>

            <tr className="bg-white hover:bg-gray-50 transition-colors lead-bg-card lead-hover-row border-b border-gray-100">
                <td className="p-6 text-sm font-bold text-gray-500 lead-text-secondary">
                    {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="p-6">
                    <div className="font-black text-axius-secondary lead-text-primary">{lead.fullName}</div>
                    <div className="text-sm text-axius-primary font-bold mt-1 lead-text-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} className="fill-current inline mr-1">
                            <path d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"/>
                        </svg> 
                        {lead.phone}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 lead-text-secondary">✉️ {lead.email}</div>
                </td>
                <td className="p-6 text-sm font-medium text-gray-600 lead-text-secondary">
                    <div className="mb-1 truncate max-w-xs" title={lead.destinations}>
                        <strong className="text-axius-secondary lead-text-primary">To:</strong> {lead.destinations || 'Undecided'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 lead-text-secondary">
                        📅 {lead.dateFrom} <span className="mx-1">&rarr;</span> {lead.dateTo}
                    </div>
                </td>
                <td className="p-6 text-sm font-black text-green-600 lead-text-green">
                    {lead.budget || 'Not specified'}
                </td>
                
                {/* HIDE THE DROPDOWN IF THEY ARE A VIEWER */}
                <td className="p-6">
                    {canManage ? (
                        <CustomLeadStatusDropdown leadId={lead.id} currentStatus={lead.status} />
                    ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            lead.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border border-green-100 fin-badge-green' :
                            lead.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100 fin-badge-gray' :
                            'bg-yellow-50 text-yellow-600 border border-yellow-100 fin-badge-orange'
                        }`}>
                            {lead.status}
                        </span>
                    )}
                </td>
                
                <td className="p-6">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer lead-btn"
                    >
                        <Eye size={14} /> View
                    </button>

                    {/* THE MODAL */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn cursor-default" style={{ textAlign: 'left' }}>
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-colors border border-transparent lead-modal-bg">
                                
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 transition-colors lead-modal-header">
                                    <div>
                                        <h2 className="text-2xl font-black text-axius-secondary lead-text-primary">Custom Tour Request</h2>
                                        <p className="text-sm font-medium text-gray-500 mt-1 lead-text-secondary">Submitted on {new Date(lead.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer lead-modal-close"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body (Scrollable) */}
                                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                    
                                    {/* Client Profile */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-colors lead-modal-muted">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 lead-text-secondary">Client Profile</h3>
                                            
                                            {/* Show status in modal as well */}
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                lead.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 fin-badge-green' :
                                                lead.status === 'CANCELLED' ? 'bg-red-100 text-red-700 fin-badge-gray' :
                                                'bg-yellow-100 text-yellow-700 fin-badge-orange'
                                            }`}>
                                                {lead.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Full Name</p>
                                                <p className="font-bold text-axius-secondary lead-text-primary">{lead.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Location</p>
                                                <p className="font-bold text-axius-secondary lead-text-primary">{lead.cityCountry || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Phone</p>
                                                <p className="font-bold text-axius-primary lead-text-blue">{lead.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1 lead-text-secondary">Email</p>
                                                <p className="font-bold text-gray-700 lead-text-primary">{lead.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Requirements Grid */}
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 transition-colors lead-text-secondary">Trip Parameters</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Calendar size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Dates</span></div>
                                            <p className="text-sm font-bold text-axius-secondary lead-text-primary">{lead.dateFrom}<br/><span className="text-gray-400 font-normal lead-text-secondary">to</span><br/>{lead.dateTo}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Users size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Pax</span></div>
                                            <p className="text-sm font-bold text-axius-secondary lead-text-primary">{lead.travelers} Travelers</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Wallet size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Budget</span></div>
                                            <p className="text-sm font-bold text-green-600 lead-text-green">{lead.budget || 'Open'}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2 lead-text-blue"><Home size={16} /> <span className="text-xs font-bold text-gray-500 lead-text-secondary">Stay</span></div>
                                            <p className="text-sm font-bold text-axius-secondary lead-text-primary">{lead.accommodation || 'Any'}</p>
                                        </div>
                                    </div>

                                    {/* Preferences */}
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mt-8 transition-colors lead-text-secondary">Preferences</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2 lead-text-secondary"><MapPin size={14}/> Destinations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {lead.destinations ? lead.destinations.split(',').map((dest: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-colors lead-modal-tag-blue">{dest.trim()}</span>
                                                )) : <span className="text-sm text-gray-400 italic lead-text-secondary">None specified</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2 lead-text-secondary">Tour Styles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {lead.tourTypes ? lead.tourTypes.split(',').map((type: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors lead-modal-tag-gray">{type.trim()}</span>
                                                )) : <span className="text-sm text-gray-400 italic lead-text-secondary">None specified</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Notes */}
                                    <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 mt-8 transition-colors lead-modal-yellow">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-yellow-800 mb-3 flex items-center gap-2 lead-modal-yellow-text">
                                            <FileText size={16}/> Additional Requirements
                                        </h3>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap lead-text-primary">
                                            {lead.requirements || <span className="italic text-gray-400 lead-text-secondary">No additional notes provided by the client.</span>}
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