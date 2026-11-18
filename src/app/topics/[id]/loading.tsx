import { RouteProgress } from "@/components/RouteProgress";
import { Skeleton, SkeletonPageHeader } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-line-subtle bg-card p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="ml-auto h-3 w-12" />
            </div>
            <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-3" style={{ width: `${70 + ((j * 9) % 25)}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
