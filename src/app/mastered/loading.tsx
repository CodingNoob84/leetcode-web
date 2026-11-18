import { RouteProgress } from "@/components/RouteProgress";
import { SkeletonPageHeader, SkeletonRows } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <SkeletonRows count={12} />
    </>
  );
}
