import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/db/queries";
import { studyOrder } from "@/lib/stats";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEARNED = ["SOLVED", "REVIEW", "MASTERED"];

export default async function TagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const tag = catalog.tags.find((t) => t.id === id);
  if (!tag) notFound();

  const ids = new Set(
    catalog.problemTags.filter((l) => l.tagId === tag.id).map((l) => l.problemId),
  );
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
