"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/dashboard/leads/actions";
import { ChevronDown } from "lucide-react";

export default function BookingStatusDropdown({ 
  bookingId, 
  currentStatus 
}: { 
  bookingId: string; 
  currentStatus: string; 
}) {
  // 1. useTransition hook for background server updates
  const [isPending, startTransition] = useTransition();
  
  // 2. Local state for instant UI update
  const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    // UI FAURAN UPDATE HO JAYEGA
    setOptimisticStatus(newStatus);

    // Server update background mein chalne dain
    startTransition(async () => {
      try {
        await updateBookingStatus(bookingId, newStatus);
      } catch (error) {
        alert("Failed to save changes.");
        // Agar error aaye toh wapas purana status laga dain
        setOptimisticStatus(currentStatus);
      }
    });
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

  // Yahan ab 'currentStatus' ki jagah 'optimisticStatus' check hoga taake color fauran change ho
  const activeTheme = themeColors[optimisticStatus] || {
    bg: "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
    text: "text-gray-800 dark:text-gray-200"
  };

  return (
    <div className={`relative inline-flex items-center ${activeTheme.text}`}>
      <select 
        value={optimisticStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`
          appearance-none border-[1.5px] rounded-full 
          pl-4 pr-10 py-1.5 min-w-[140px]
          outline-none font-black text-[10px] uppercase tracking-widest 
          cursor-pointer transition-all
          ${activeTheme.bg} 
          /* Force the select to inherit the color from the wrapper */
          text-inherit
          ${isPending ? 'opacity-50 cursor-wait' : 'hover:shadow-md active:scale-95'}
        `}
      >
        <option value="PENDING" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Pending</option>
        <option value="CONFIRMED" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Confirmed</option>
        <option value="CANCELLED" className="text-gray-900 bg-white dark:bg-slate-900 dark:text-white">Cancelled</option>
      </select>
      
      <div className="absolute right-3 pointer-events-none flex items-center justify-center">
        {isPending ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronDown size={14} strokeWidth={3} className="text-inherit" />
        )}
      </div>
    </div>
  );
}