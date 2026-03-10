"use client";

import { useState } from 'react';
import { Eye, X, Calendar, MapPin, Users, Wallet, Home, FileText } from 'lucide-react';
import CustomLeadStatusDropdown from '@/components/CustomLeadStatusDropdown';

export default function CustomLeadRow({ lead }: { lead: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="p-6 text-sm font-bold text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString()}
            </td>
            <td className="p-6">
                <div className="font-black text-axius-secondary">{lead.fullName}</div>
                <div className="text-sm text-axius-primary font-bold mt-1">📱 {lead.phone}</div>
                <div className="text-xs text-gray-500 mt-1">✉️ {lead.email}</div>
            </td>
            <td className="p-6 text-sm font-medium text-gray-600">
                <div className="mb-1 truncate max-w-xs" title={lead.destinations}>
                    <strong className="text-axius-secondary">To:</strong> {lead.destinations || 'Undecided'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    📅 {lead.dateFrom} <span className="mx-1">&rarr;</span> {lead.dateTo}
                </div>
            </td>
            <td className="p-6 text-sm font-black text-green-600">
                {lead.budget || 'Not specified'}
            </td>
            <td className="p-6">
                <CustomLeadStatusDropdown leadId={lead.id} currentStatus={lead.status} />
            </td>
            
            {/* THE FIX: Everything happens inside this final <td> */}
            <td className="p-6">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                    <Eye size={14} /> View
                </button>

                {/* The Modal is now safely inside the table cell */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn cursor-default" style={{ textAlign: 'left' }}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-axius-secondary">Custom Tour Request</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Submitted on {new Date(lead.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                
                                {/* Client Profile */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Client Profile</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                            <p className="font-bold text-axius-secondary">{lead.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Location</p>
                                            <p className="font-bold text-axius-secondary">{lead.cityCountry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                                            <p className="font-bold text-axius-primary">{lead.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <p className="font-bold text-gray-700">{lead.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Trip Requirements Grid */}
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Trip Parameters</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 text-axius-primary mb-2"><Calendar size={16} /> <span className="text-xs font-bold text-gray-500">Dates</span></div>
                                        <p className="text-sm font-bold text-axius-secondary">{lead.dateFrom}<br/><span className="text-gray-400 font-normal">to</span><br/>{lead.dateTo}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-axius-primary mb-2"><Users size={16} /> <span className="text-xs font-bold text-gray-500">Pax</span></div>
                                        <p className="text-sm font-bold text-axius-secondary">{lead.travelers} Travelers</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-axius-primary mb-2"><Wallet size={16} /> <span className="text-xs font-bold text-gray-500">Budget</span></div>
                                        <p className="text-sm font-bold text-green-600">{lead.budget || 'Open'}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-axius-primary mb-2"><Home size={16} /> <span className="text-xs font-bold text-gray-500">Stay</span></div>
                                        <p className="text-sm font-bold text-axius-secondary">{lead.accommodation || 'Any'}</p>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mt-8">Preferences</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><MapPin size={14}/> Destinations</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lead.destinations ? lead.destinations.split(',').map((dest: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{dest.trim()}</span>
                                            )) : <span className="text-sm text-gray-400 italic">None specified</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-2">Tour Styles</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lead.tourTypes ? lead.tourTypes.split(',').map((type: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">{type.trim()}</span>
                                            )) : <span className="text-sm text-gray-400 italic">None specified</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100 mt-8">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-yellow-800 mb-3 flex items-center gap-2">
                                        <FileText size={16}/> Additional Requirements
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {lead.requirements || <span className="italic text-gray-400">No additional notes provided by the client.</span>}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </td>
        </tr>
    );
}