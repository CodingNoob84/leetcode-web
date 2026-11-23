"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { studyOrder } from "@/lib/stats";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";
import { deriveSpecificTags } from "@/lib/tags";

const LEARNED = ["SOLVED", "REVIEW", "MASTERED"];

export default function TagPage() {
  const { id } = useParams<{ id: string }>();
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading tag…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load tag.</p>;
  }

  const tag = deriveSpecificTags(catalog).find((t) => t.id === id);
  if (!tag) {
    return (
      <EmptyState
        title="Tag not found"
        body="This tag may have been renamed or removed from the catalog."
      />
    );
  }

  const ids = new Set(tag.problemIds);
  const ordered = studyOrder(
    catalog.problems.filter((p) => ids.has(p.id)),
    catalog.topics,
    catalog.subpatterns,
    catalog.problemSubpatterns,
  );
  const rank = new Map(ordered.map((p, i) => [p.id, i]));
  const problems = catalog.problems
    .filter((p) => ids.has(p.id))
    .sort(
      (a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
  const learned = problems.filter((p) => LEARNED.includes(catalog.statuses[p.id] ?? "")).length;

  return (
    <>
      <BackLink href="/tags">All tags</BackLink>

      <PageHeader
        title={tag.name}
        subtitle={`${problems.length} problem${problems.length === 1 ? "" : "s"} · ${learned} learned`}
      />
      {tag.description ? <p className="-mt-4 mb-6 text-sm text-muted">{tag.description}</p> : null}

      <div className="mb-4 max-w-sm">
        <ProgressBar frac={problems.length ? learned / problems.length : 0} />
      </div>

      <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
        {problems.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">No problems carry this tag yet.</p>
        ) : (
          problems.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={catalog.statuses[p.id]}
              confidence={catalog.confidence[p.id]}
              reviewedAt={catalog.reviewedAt[p.id]}
              from={`tag:${tag.id}`}
            />
          ))
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        <Link href="/tags" className="font-semibold text-secondary hover:underline">
          ← All tags
        </Link>
      </p>
    </>
  );
}
