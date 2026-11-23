"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProblemBrowser } from "@/components/ProblemBrowser";
import { BackLink, PageHeader } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";

export default function ProblemsPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-sm text-muted">Loading problems…</p>}>
      <ProblemsView />
    </Suspense>
  );
}

function ProblemsView() {
  const searchParams = useSearchParams();
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading problems…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load problems.</p>;
  }

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Problems"
        subtitle="Search, filter and drill into the shared catalog."
      />
      <ProblemBrowser
        problems={catalog.problems}
        topics={catalog.topics}
        subpatterns={catalog.subpatterns.map((sp) => ({
          id: sp.id,
          topicId: sp.topicId,
          name: sp.name,
          position: sp.position,
        }))}
        problemSubpatterns={catalog.problemSubpatterns}
        statuses={catalog.statuses}
        confidence={catalog.confidence}
        reviewedAt={catalog.reviewedAt}
        initialState={searchParams.get("state") ?? ""}
        initialTopic={searchParams.get("topic") ?? ""}
      />
    </>
  );
}
