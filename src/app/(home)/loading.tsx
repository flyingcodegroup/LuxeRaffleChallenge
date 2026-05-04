// Skeleton's row count and per-card height roughly match the real
// grid, so the page doesn't grow noticeably when the data swaps in
// and the footer doesn't jump (Cumulative Layout Shift).
export default function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">LuxeRaffle</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse flex flex-col"
            aria-hidden="true"
          >
            <div className="w-full h-48 bg-gray-200" />
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-7 bg-gray-200 rounded w-12" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="space-y-1.5 mb-4 flex-grow">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="flex justify-between gap-2">
                <div className="h-9 bg-gray-200 rounded w-24" />
                <div className="h-9 bg-gray-200 rounded w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading raffles…</span>
    </div>
  );
}
