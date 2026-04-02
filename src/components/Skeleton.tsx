export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted/50 ${className || "h-32"}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <SkeletonCard className="h-6 w-32" />
        <SkeletonCard className="h-12 w-80" />
        <SkeletonCard className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
