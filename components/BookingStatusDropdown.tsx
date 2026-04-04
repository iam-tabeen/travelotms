"use client";

import { useState } from "react";
import { updateBookingStatus } from "@/app/admin/leads/actions";
import { ChevronDown } from "lucide-react";

export default function BookingStatusDropdown({ 
  bookingId, 
  currentStatus 
}: { 
  bookingId: string; 
  currentStatus: string; 
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsSaving(true);
    const newStatus = e.target.value;
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (error) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Separate the Backgrounds from the Text Colors
  const themeColors: Record<string, { bg: string, text: string }> = {
    PENDING: {
      bg: "bg-orange-100 border-orange-300 dark:bg-orange-500/10 dark:border-orange-500/30",
      text: "text-orange-800 dark:text-orange-400"
    },
    CONFIRMED: {
      bg: "bg-emerald-100 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30",
      text: "text-emerald-800 dark:text-emerald-400"
    },
    CANCELLED: {
      bg: "bg-red-100 border-red-300 dark:bg-red-500/10 dark:border-red-500/30",
      text: "text-red-800 dark:text-red-400"
    }
  };

  const activeTheme = themeColors[currentStatus] || {
    bg: "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
    text: "text-gray-800 dark:text-gray-200"
  };

  return (
  
    <div className={`relative inline-flex items-center ${activeTheme.text}`}>
      <select 
        value={currentStatus}
        onChange={handleChange}
        disabled={isSaving}
        className={`
          appearance-none border-[1.5px] rounded-full 
          pl-4 pr-10 py-1.5 min-w-[140px]
          outline-none font-black text-[10px] uppercase tracking-widest 
          cursor-pointer transition-all
          ${activeTheme.bg} 
          /* Force the select to inherit the color from the wrapper */
          text-inherit
          ${isSaving ? 'opacity-50 cursor-wait' : 'hover:shadow-md active:scale-95'}
        `}
      >
        <option value="PENDING" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Pending</option>
        <option value="CONFIRMED" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Confirmed</option>
        <option value="CANCELLED" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Cancelled</option>
      </select>
      
      <div className="absolute right-3 pointer-events-none flex items-center justify-center">
        {isSaving ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
 
          <ChevronDown size={14} strokeWidth={3} className="text-inherit" />
        )}
      </div>
    </div>
  );
}