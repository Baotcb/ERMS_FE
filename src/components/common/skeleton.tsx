/**
 * Skeleton Loading Components
 * Provides placeholder UI during loading states
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  )
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  )
}

export function NavbarSkeleton() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-sidebar-border h-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
        <Skeleton className="w-32 h-8" />
        <div className="hidden md:flex items-center gap-6 h-full">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-20 h-8" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </nav>
  )
}
