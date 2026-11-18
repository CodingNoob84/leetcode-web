import { RouteProgress } from "@/components/RouteProgress";
import { Skeleton, SkeletonPageHeader, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="skeleton h-3 w-20" />
          <div className="mt-2 rounded-card border border-line-subtle bg-card p-4">
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-3"
                  style={{ width: `${94 - ((i * 11) % 40)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 skeleton h-3 w-28" />
          <div className="mt-2 space-y-3">
            <div className="rounded-card border border-line-subtle bg-card p-4">
              <Skeleton className="h-3 w-24" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-3" style={{ width: `${80 - i * 9}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 skeleton h-3 w-24" />
          <div className="mt-2 rounded-card border border-line-subtle bg-card p-4">
            <Skeleton className="h-4 w-40" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
          </div>
        </div>

        <aside className="min-w-0 space-y-6">
          <div>
            <div className="skeleton h-3 w-40" />
            <div className="mt-2 rounded-card border border-line-subtle bg-card p-4">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 flex-1 rounded-card" />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="skeleton h-3 w-20" />
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
