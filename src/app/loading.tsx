import { RouteProgress } from "@/components/RouteProgress";
import {
  SkeletonChips,
  SkeletonGrid,
  SkeletonHero,
  SkeletonPageHeader,
  SkeletonRows,
} from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <SkeletonHero />
      <div className="mt-8 mb-3 h-3 w-24 skeleton" />
      <SkeletonGrid count={6} />
    </>
  );
}
