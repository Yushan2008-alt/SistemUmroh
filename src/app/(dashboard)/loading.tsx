export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-72 bg-muted/60 rounded-md" />
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="w-8 h-8 rounded-lg bg-muted" />
            </div>
            <div className="h-8 w-32 bg-muted rounded-lg" />
            <div className="h-3 w-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-8 w-28 bg-muted rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
