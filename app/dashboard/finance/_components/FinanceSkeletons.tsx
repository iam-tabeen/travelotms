export function FinanceStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-36 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FinanceChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 flex-1 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 animate-pulse">
      <div className="h-4 w-44 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-3">
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
            <div className="h-4 bg-gray-100 rounded col-span-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceExportButtonSkeleton() {
  return <div className="h-10 w-40 rounded-xl bg-blue-100 animate-pulse" />;
}
