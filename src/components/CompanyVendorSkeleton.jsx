export default function CompanyVendorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Skeleton Cards */}
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl p-5 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="w-48 h-4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="w-28 h-3 rounded bg-gray-100 dark:bg-gray-800/60" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-20 h-6 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>

          {/* Nested Vendor Rows Preview */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-2.5">
            <div className="w-full h-8 rounded-lg bg-gray-100 dark:bg-gray-800/40" />
            <div className="w-full h-8 rounded-lg bg-gray-100 dark:bg-gray-800/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
