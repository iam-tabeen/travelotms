import React from 'react';

export default function AdminLoading() {
  return (
    <>
      <style>{`
        /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
        html.dark .load-bg-main { background-color: #0F172A !important; }
        html.dark .load-border-track { border-color: #334155 !important; }
        html.dark .load-border-spin { border-color: #3B82F6 !important; border-top-color: transparent !important; }
        html.dark .load-text { color: #94A3B8 !important; }
      `}</style>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#F0F2F7] transition-colors duration-300 load-bg-main">
        
        {/* The Spinner */}
        <div className="relative w-16 h-16 mb-6">
          {/* Spinner Track */}
          <div className="absolute inset-0 border-4 border-[#E5E9F2] rounded-full transition-colors duration-300 load-border-track"></div>
          
          {/* Spinning Indicator */}
          <div className="absolute inset-0 border-4 border-[#003580] rounded-full border-t-transparent animate-spin transition-colors duration-300 load-border-spin"></div>
        </div>
        
        {/* The Loading Text */}
        <p className="text-[#8A93A7] font-bold text-xs tracking-[0.2em] uppercase animate-pulse transition-colors duration-300 load-text">
          Fetching Data...
        </p>
        
      </div>
    </>
  );
}