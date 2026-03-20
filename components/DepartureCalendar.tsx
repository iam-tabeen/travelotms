"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, X, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    bookedSeats: number;
    maxCapacity: number;
}

export default function DepartureCalendar({ events }: { events: CalendarEvent[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // NEW STATE: Tracks which event was clicked for the popup
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calendar Math
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Create an array for the grid cells
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative transition-colors duration-300 cal-bg-card cal-border-main">
            
            {/* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */}
            <style>{`
                html.dark .cal-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .cal-border-main { border-color: #334155 !important; }
                
                html.dark .cal-header-bg { background-color: #0F172A !important; border-color: #334155 !important; }
                html.dark .cal-text-primary { color: #FFFFFF !important; }
                html.dark .cal-text-secondary { color: #94A3B8 !important; }
                
                /* Nav Buttons */
                html.dark .cal-nav-btn { background-color: #1E293B !important; border-color: #475569 !important; color: #E2E8F0 !important; }
                html.dark .cal-nav-btn:hover { background-color: #334155 !important; }
                html.dark .cal-nav-icon { color: #E2E8F0 !important; }

                /* Grid Lines & Cells */
                html.dark .cal-grid-bg { background-color: #334155 !important; }
                html.dark .cal-cell-empty { background-color: #0F172A !important; }
                html.dark .cal-cell-filled { background-color: #1E293B !important; }
                html.dark .cal-cell-filled:hover { background-color: rgba(30, 41, 59, 0.8) !important; }
                html.dark .cal-today-cell { background-color: rgba(59, 130, 246, 0.1) !important; box-shadow: inset 0 0 0 2px #3B82F6 !important; }
                
                /* Event Pills */
                html.dark .cal-event-blue { background-color: rgba(59, 130, 246, 0.15) !important; border-color: rgba(59, 130, 246, 0.3) !important; color: #60A5FA !important; }
                html.dark .cal-event-red { background-color: rgba(239, 68, 68, 0.15) !important; border-color: rgba(239, 68, 68, 0.3) !important; color: #F87171 !important; }
                html.dark .cal-full-badge { background-color: rgba(239, 68, 68, 0.2) !important; color: #FCA5A5 !important; }

                /* Modal Styles */
                html.dark .cal-modal-bg { background-color: #1E293B !important; }
                html.dark .cal-modal-header { background-color: #0F172A !important; border-color: #334155 !important; }
                html.dark .cal-modal-footer { background-color: #0F172A !important; border-color: #334155 !important; }
                html.dark .cal-btn-outline { background-color: #1E293B !important; border-color: #475569 !important; color: #E2E8F0 !important; }
                html.dark .cal-btn-outline:hover { background-color: #334155 !important; }
                html.dark .cal-stats-box { background-color: rgba(59, 130, 246, 0.1) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
                html.dark .cal-progress-track { background-color: #334155 !important; }
            `}</style>

            {/* Header Controls */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 transition-colors duration-300 cal-header-bg">
                <h2 className="text-xl font-black text-[#0A1628] uppercase tracking-tight transition-colors duration-300 cal-text-primary">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer cal-nav-btn">
                        <ChevronLeft size={20} className="text-gray-600 transition-colors cal-nav-icon" />
                    </button>
                    <button onClick={nextMonth} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer cal-nav-btn">
                        <ChevronRight size={20} className="text-gray-600 transition-colors cal-nav-icon" />
                    </button>
                </div>
            </div>

            {/* HORIZONTAL SCROLL WRAPPER FOR MOBILE */}
            <div className="overflow-x-auto custom-scrollbar">
                {/* MIN-WIDTH forces the calendar to never squish smaller than 700px */}
                <div style={{ minWidth: '700px' }}>
                    
                    {/* Days of Week Row */}
                    <div 
                        className="border-b border-gray-100 bg-white transition-colors duration-300 cal-bg-card cal-border-main"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
                    >
                        {daysOfWeek.map(day => (
                            <div key={day} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest transition-colors duration-300 cal-text-secondary">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div 
                        className="bg-gray-200 gap-[1px] transition-colors duration-300 cal-grid-bg"
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                            gridAutoRows: '120px'
                        }}
                    >
                        {days.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="bg-gray-50/50 transition-colors duration-300 cal-cell-empty" />;
                            }

                            const daysEvents = events.filter(e => {
                                const eDate = new Date(e.date);
                                return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
                            });

                            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                            return (
                                <div key={day} className={`bg-white p-2 md:p-3 transition-colors hover:bg-gray-50 flex flex-col cal-cell-filled ${isToday ? 'ring-2 ring-inset ring-[#2563EB] bg-blue-50/10 cal-today-cell' : ''}`}>
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 transition-colors duration-300 ${isToday ? 'bg-[#2563EB] text-white' : 'text-gray-400 cal-text-secondary'}`}>
                                        {day}
                                    </span>
                                    
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                                        {daysEvents.map(event => {
                                            const isFull = event.maxCapacity > 0 && event.bookedSeats >= event.maxCapacity;
                                            
                                            return (
                                                <button 
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)} 
                                                    className={`w-full block px-2.5 py-2 rounded-lg text-left transition-transform hover:-translate-y-0.5 shadow-sm border cursor-pointer ${
                                                        isFull 
                                                        ? 'bg-red-50 border-red-100 text-red-700 cal-event-red' 
                                                        : 'bg-blue-50 border-blue-100 text-[#2563EB] cal-event-blue'
                                                    }`}
                                                >
                                                    <div className="text-[11px] font-bold truncate">{event.title}</div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-70">
                                                            <Users size={10} />
                                                            {event.bookedSeats} / {event.maxCapacity || '∞'}
                                                        </div>
                                                        {isFull && <span className="text-[8px] font-black uppercase tracking-wider bg-red-100 px-1 rounded cal-full-badge">Full</span>}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- POPUP MODAL --- */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                    {/* Modal Box */}
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-colors duration-300 cal-modal-bg" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 transition-colors duration-300 cal-modal-header">
                            <h3 className="font-black text-[#0A1628] uppercase tracking-tight flex items-center gap-2 transition-colors duration-300 cal-text-primary">
                                <Info size={18} className="text-[#2563EB]" />
                                Tour Details
                            </h3>
                            <button onClick={() => setSelectedEvent(null)} className="text-red-500 hover:text-gray-700 bg-white border border-gray-200 rounded-full p-2 transition-colors cursor-pointer shadow-sm cal-nav-btn">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 leading-tight transition-colors duration-300 cal-text-primary">{selectedEvent.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-2 transition-colors duration-300 cal-text-secondary">
                                    <CalendarIcon size={16} className="text-[#2563EB]" />
                                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 transition-colors duration-300 cal-stats-box">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest transition-colors duration-300 cal-text-secondary">Seats Booked</span>
                                    <span className="text-lg font-black text-[#2563EB]">{selectedEvent.bookedSeats} <span className="text-sm text-gray-400 font-bold transition-colors duration-300 cal-text-secondary">/ {selectedEvent.maxCapacity || '∞'}</span></span>
                                </div>
                                
                                {/* Visual Progress Bar */}
                                {selectedEvent.maxCapacity > 0 && (
                                    <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden transition-colors duration-300 cal-progress-track">
                                        <div 
                                            className={`h-2.5 rounded-full transition-colors duration-300 ${selectedEvent.bookedSeats >= selectedEvent.maxCapacity ? 'bg-red-500' : 'bg-[#2563EB]'}`} 
                                            style={{ width: `${Math.min((selectedEvent.bookedSeats / selectedEvent.maxCapacity) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end transition-colors duration-300 cal-modal-footer">
                            <a 
                                href="/admin/tours" 
                                className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer cal-btn-outline"
                            >
                                Go to Tours List
                            </a>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}