import React from 'react';
import prisma from '@/lib/prisma';

export default async function Loading() {
  // 1. Fetch the tenant to get your dynamic colors for the loader
  const tenant = await prisma.tenant.findFirst();
  
  // Set fallbacks just in case
  const primaryColor = tenant?.primaryColor || '#003580';

  return (
    // The main background is now set to pure white
    <div className="min-h-screen flex flex-col items-center justify-center z-[9999] relative bg-white">
      
      {/* Uiverse Spinner rebuilt for React & Tailwind */}
      <div className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center">
        
        {/* The spinning gradient ring */}
        {/* THE FIX: Removed extra quotes and faded the primary color into white */}
        <div 
          className="absolute inset-0 w-full h-full rounded-full animate-[spin_0.5s_infinite_linear]"
          style={{ 
            backgroundImage: `linear-gradient(0deg, ${primaryColor} 0%, white 50%)` 
          }}
        ></div>
        
        {/* The inner mask */}
        {/* THE FIX: Changed to white so it blends with the background, leaving only the colored ring! */}
        <div className="absolute w-[85%] h-[85%] rounded-full bg-white"></div>
        
      </div>

    </div>
  );
}