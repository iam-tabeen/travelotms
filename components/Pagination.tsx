'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    // Changed justify-between to justify-start and added a gap
    <div className="flex items-center justify-start gap-8">
      
      {/* 1. BUTTONS MOVED TO THE LEFT */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors lead-border-main lead-text-secondary"
        style={{cursor:"pointer"}}>
          <ChevronLeft size={18} />
        </button>
        
        <button
          onClick={() => router.push(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors lead-border-main lead-text-secondary"
          style={{cursor:"pointer"}}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 2. PAGE INFO MOVED NEXT TO BUTTONS */}
      <p className="text-sm text-gray-500 font-medium lead-text-secondary">
        Page <span className="font-bold text-gray-900 lead-text-primary">{currentPage}</span> of <span className="font-bold text-gray-900 lead-text-primary">{totalPages}</span>
      </p>

    </div>
  );
}