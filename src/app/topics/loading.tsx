import { RouteProgress } from "@/components/RouteProgress";
import { SkeletonGrid, SkeletonPageHeader } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <RouteProgress />
      <SkeletonPageHeader />
      <SkeletonGrid count={8} />
    </>
  );
}
