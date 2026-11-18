import { RouteProgress } from "@/components/RouteProgress";
import { Skeleton, SkeletonPageHeader, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <Skeleton className="mb-4 h-1.5 w-full max-w-sm rounded-full" />
      <SkeletonRows count={10} />
    </>
  );
}
