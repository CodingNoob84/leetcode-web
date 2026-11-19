"use client";

import { useParams } from "next/navigation";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";

export default function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading list…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load list.</p>;
  }

  const list = catalog.lists.find((l) => l.id === id);
  if (!list) {
    return (
      <EmptyState
        title="List not found"
        body="This study list may have been removed from the catalog."
      />
    );
  }

  const problems = catalog.listEntries
    .filter((e) => e.listId === id)
    .sort((a, b) => a.position - b.position)
    .flatMap((e) => {
      const p = catalog.problems.find((x) => x.id === e.problemId);
      return p ? [p] : [];
    });

  const learnedCount = problems.filter(
    (p) => ["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[p.id] ?? ""),
  ).length;

  return (
    <>
      <BackLink href="/lists">All lists</BackLink>
      <PageHeader
        title={list.name}
        subtitle={`${problems.length} problems · ${learnedCount} learned`}
      />
      {list.description ? (
        <p className="-mt-4 mb-6 text-sm text-muted">{list.description}</p>
      ) : null}

      <div className="mb-4 max-w-sm">
        <ProgressBar frac={problems.length ? learnedCount / problems.length : 0} />
      </div>

      <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
        {problems.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">This list is empty</p>
        ) : (
          problems.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={catalog.statuses[p.id]}
              confidence={catalog.confidence[p.id]}
              reviewedAt={catalog.reviewedAt[p.id]}
              from={`list:${list.id}`}
            />
          ))
        )}
      </div>
    </>
  );
}
