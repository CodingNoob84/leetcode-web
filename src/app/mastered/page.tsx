"use client";

import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";

export default function MasteredPage() {
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading mastered problems…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load progress.</p>;
  }

  const mastered = catalog.problems.filter((p) => catalog.confidence[p.id] === 5);

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Mastered"
        subtitle="Problems you rated 5 — they will not come back."
      />
      {mastered.length === 0 ? (
        <EmptyState
          title="Nothing mastered yet"
          body="Rate a problem 5 on its page once it sticks — it lands here."
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
          {mastered.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={catalog.statuses[p.id]}
              confidence={catalog.confidence[p.id]}
              reviewedAt={catalog.reviewedAt[p.id]}
            />
          ))}
        </div>
      )}
    </>
  );
}
