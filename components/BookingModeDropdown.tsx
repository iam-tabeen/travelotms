"use client";

import { useState } from "react";
import { toast } from "react-hot-toast"; 
import { quickUpdateBookingMode } from "@/app/admin/add-tour/actions";

export default function BookingModeDropdown({ 
  tourId, 
  currentMode 
}: { 
  tourId: string; 
  currentMode: string; 
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsSaving(true);
    const newMode = e.target.value;
    
    try {
      // We await the server action
      await quickUpdateBookingMode(tourId, newMode);
      
      // Fire the success toast!
      toast.success("Booking mode updated!");
      
    } catch (error) {
      console.error("Failed to update booking mode");
      // Fire the error toast instead of an alert!
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 🛡️ Safe Dark Mode Polyfill for Dropdown 🛡️ */}
      <style>{`
        html.dark .tour-mode-dropdown {
          background-color: #1E293B !important;
          color: #E2E8F0 !important;
          border-color: #334155 !important;
        }
        html.dark .tour-mode-dropdown:hover {
          border-color: #475569 !important;
        }
        html.dark .tour-mode-dropdown:focus {
          border-color: #3B82F6 !important;
        }
      `}</style>
      
      <select 
        value={currentMode}
        onChange={handleChange}
        disabled={isSaving}
        className={`tour-mode-dropdown bg-white border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#2563EB] font-bold text-gray-700 text-xs shadow-sm cursor-pointer transition-all ${isSaving ? 'opacity-50 cursor-wait' : 'hover:border-gray-300'}`}
      >
        <option value="BOTH">📄 Form & WhatsApp</option>
        <option value="WHATSAPP">📱 WhatsApp Only</option>
        <option value="FORM">📋 Form Only</option>
      </select>
    </>
  );
}