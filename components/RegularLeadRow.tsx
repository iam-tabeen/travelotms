"use client";

import { useState } from 'react';
import { Eye, X, Calendar, MapPin, Users, Wallet, FileText } from 'lucide-react';
import BookingStatusDropdown from '@/components/BookingStatusDropdown';

export default function RegularLeadRow({ booking }: { booking: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            {/* 1. Date */}
            <td className="p-6 text-sm font-bold text-gray-500">
                {new Date(booking.createdAt).toLocaleDateString()}
            </td>
            
            {/* 2. Client */}
            <td className="p-6">
                <div className="font-black text-axius-secondary">{booking.customerName}</div>
                <div className="text-sm text-axius-primary font-bold mt-1">📱 {booking.customerPhone}</div>
                <div className="text-xs text-gray-500 mt-1">✉️ {booking.customerEmail}</div>
            </td>
            
            {/* 3. Expedition */}
            <td className="p-6 text-sm font-bold text-axius-secondary">
                {booking.tour?.title || "Deleted Tour"}
                {booking.specialNotes && (
                    <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 truncate max-w-[200px]" title={booking.specialNotes}>
                        <span className="font-black">Note:</span> {booking.specialNotes}
                    </div>
                )}
            </td>
            
            {/* 4. Pax & Date */}
            <td className="p-6">
                <div className="text-sm font-bold text-gray-700">👥 {booking.numTravelers} Travelers</div>
                <div className="text-xs font-bold text-gray-500 mt-1">📅 {new Date(booking.travelDate).toLocaleDateString()}</div>
            </td>
            
            {/* 5. Value */}
            <td className="p-6 text-lg font-black text-green-600">
                Rs. {booking.totalPrice.toLocaleString()}
            </td>
            
            {/* 6. Status & View Button (Safely containing the Modal!) */}
            <td className="p-6">
                <div className="flex items-center gap-3">
                    <BookingStatusDropdown bookingId={booking.id} currentStatus={booking.status} />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                </div>

                {/* THE MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn cursor-default" style={{ textAlign: 'left' }}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-axius-secondary">Booking Details</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">Submitted on {new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Client Profile</h3>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                                <p className="font-bold text-axius-secondary">{booking.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                                <p className="font-bold text-axius-primary">{booking.customerPhone}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                                <p className="font-bold text-gray-700">{booking.customerEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sm:text-right bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Status</h3>
                                        <BookingStatusDropdown bookingId={booking.id} currentStatus={booking.status} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-6">Expedition Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="col-span-2 md:col-span-4 bg-[#FBFDFF] border border-blue-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-axius-primary mb-1"><MapPin size={16} /> <span className="text-xs font-bold text-gray-500">Tour Name</span></div>
                                            <p className="text-lg font-black text-axius-secondary">{booking.tour?.title || "Deleted Tour"}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2"><Calendar size={16} /> <span className="text-xs font-bold text-gray-500">Travel Date</span></div>
                                            <p className="text-sm font-bold text-axius-secondary">{new Date(booking.travelDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-axius-primary mb-2"><Users size={16} /> <span className="text-xs font-bold text-gray-500">Pax</span></div>
                                            <p className="text-sm font-bold text-axius-secondary">{booking.numTravelers} Travelers</p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-axius-primary mb-2"><Wallet size={16} /> <span className="text-xs font-bold text-gray-500">Total Value</span></div>
                                            <p className="text-xl font-black text-green-600">Rs. {booking.totalPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-100">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-yellow-800 mb-3 flex items-center gap-2">
                                        <FileText size={16}/> Special Notes & Requests
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {booking.specialNotes || <span className="italic text-gray-400">No special notes provided.</span>}
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