import { RouteProgress } from "@/components/RouteProgress";
import {
  SkeletonChips,
  SkeletonPageHeader,
  SkeletonRows,
} from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <div className="mb-4 space-y-3">
        <div className="skeleton h-11 w-full rounded-card" />
        <SkeletonChips count={4} />
        <SkeletonChips count={5} />
      </div>
      <SkeletonRows count={12} />
    </>
  );
}
