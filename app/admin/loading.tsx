import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#F0F2F7]">
      {/* The Spinner */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-[#E5E9F2] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#003580] rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* The Loading Text */}
      <p className="text-[#8A93A7] font-bold text-xs tracking-[0.2em] uppercase animate-pulse">
        Fetching Data...
      </p>
    </div>
  );
}