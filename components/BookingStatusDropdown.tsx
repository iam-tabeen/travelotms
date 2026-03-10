// components/BookingStatusDropdown.tsx
"use client";

import { useState } from "react";
import { updateBookingStatus } from "@/app/admin/leads/actions";

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
      console.error("Failed to update status");
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine colors based on the current status
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
  if (currentStatus === 'PENDING') colorClass = 'bg-orange-100 text-orange-700 border-orange-200';
  if (currentStatus === 'CONFIRMED') colorClass = 'bg-green-100 text-green-700 border-green-200';
  if (currentStatus === 'CANCELLED') colorClass = 'bg-red-100 text-red-700 border-red-200';

  return (
    <select 
      value={currentStatus}
      onChange={handleChange}
      disabled={isSaving}
      className={`border-2 rounded-full px-4 py-1.5 outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all ${colorClass} ${isSaving ? 'opacity-50 cursor-wait' : 'hover:brightness-95'}`}
    >
      <option value="PENDING">Pending</option>
      <option value="CONFIRMED">Confirmed</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}