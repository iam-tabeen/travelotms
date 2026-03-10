"use client";

import { useState } from "react";
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
      await quickUpdateBookingMode(tourId, newMode);
    } catch (error) {
      console.error("Failed to update booking mode");
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <select 
      value={currentMode}
      onChange={handleChange}
      disabled={isSaving}
      className={`border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-axius-primary font-bold text-axius-secondary text-xs shadow-sm cursor-pointer transition-all ${isSaving ? 'opacity-50 cursor-wait' : 'hover:border-gray-300'}`}
    >
      <option value="BOTH">📄 Form & WhatsApp</option>
      <option value="WHATSAPP">📱 WhatsApp Only</option>
      <option value="FORM">📋 Form Only</option>
    </select>
  );
}