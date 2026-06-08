export function ToursHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-36 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function ToursStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-20 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ToursTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 animate-pulse">
      <div className="h-6 w-44 bg-gray-200 rounded mb-6" />
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
