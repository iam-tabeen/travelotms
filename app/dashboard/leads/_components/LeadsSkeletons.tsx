export function LeadsHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="h-8 w-56 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="h-12 w-40 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-12 bg-gray-100 rounded-xl mt-5" />
    </div>
  );
}

export function LeadsTabsSkeleton() {
  return (
    <div className="h-14 border-b border-gray-200 flex gap-3 items-end">
      <div className="h-10 w-48 bg-gray-100 rounded-t-xl animate-pulse" />
      <div className="h-10 w-48 bg-gray-100 rounded-t-xl animate-pulse" />
    </div>
  );
}

export function LeadsTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 animate-pulse">
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="h-4 bg-gray-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
