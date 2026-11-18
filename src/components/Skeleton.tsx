// Skeleton primitives used by the route loading states. They mirror the real
// layout closely enough that the swap to content feels like one motion.

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-card border border-line-subtle bg-card p-4 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}

export function SkeletonRows({
  count = 8,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-card border border-line-subtle bg-card ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton
            className="h-3 flex-1"
            style={{ maxWidth: `${60 + ((i * 13) % 35)}%` }}
          />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-3.5 w-72" />
      </div>
      <Skeleton className="h-7 w-28 rounded-full" />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <section className="rounded-panel border border-line-subtle bg-card p-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-card" />
        ))}
      </div>
    </section>
  );
}

export function SkeletonChips({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-20 rounded-full" />
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
