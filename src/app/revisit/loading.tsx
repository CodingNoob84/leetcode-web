import { RouteProgress } from "@/components/RouteProgress";
import { Skeleton, SkeletonPageHeader, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <Skeleton className="mb-4 h-10 w-full rounded-card" />
      <SkeletonRows count={6} />
      <div className="mt-8 skeleton h-3 w-24" />
      <SkeletonRows count={4} />
    </>
  );
}
