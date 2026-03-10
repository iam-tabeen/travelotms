"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    startTransition(() => {
      router.replace(`/?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
      <input
        type="text"
        placeholder="Search destinations (e.g. Hunza, Skardu)..."
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-axius-primary focus:border-axius-primary sm:text-sm transition-all shadow-sm"
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-axius-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}