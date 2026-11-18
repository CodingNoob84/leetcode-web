import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/db/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const topic = catalog.topics.find((t) => t.id === id);
  if (!topic) notFound();

  const patterns = catalog.subpatterns.filter((sp) => sp.topicId === topic.id);
  const topicProblemIds = catalog.problemTopics
    .filter((l) => l.topicId === topic.id)
    .map((l) => l.problemId);
  const learnedCount = topicProblemIds.filter(
    (pid) => ["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[pid] ?? ""),
  ).length;

  return (
    <>
      <BackLink href="/topics">All topics</BackLink>
      <PageHeader
        title={topic.name}
        subtitle={`${topicProblemIds.length} problems · ${learnedCount} learned · work through the patterns in order`}
      />

      <div className="space-y-4">
        {patterns.map((sp, i) => {
          const rows = catalog.problems.filter((p) =>
            catalog.problemSubpatterns.some(
              (l) => l.problemId === p.id && l.subpatternId === sp.id,
            ),
          );
          const learned = rows.filter(
            (p) => ["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[p.id] ?? ""),
          ).length;
          return (
            <section
              key={sp.id}
              id={`sp-${sp.id}`}
              className="scroll-mt-24 rounded-card border border-line-subtle bg-card p-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-placeholder">{i + 1}</span>
                <span className="flex-1 text-[15px] font-semibold text-ink">{sp.name}</span>
                <span
                  className={`text-xs ${
                    rows.length > 0 && learned === rows.length
                      ? "text-primary"
                      : "text-muted"
                  }`}
                >
                  {learned}/{rows.length}
                </span>
              </div>
              <ProgressBar frac={rows.length ? learned / rows.length : 0} />

              {sp.identification || sp.strategy ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {sp.identification ? (
                    <div className="rounded-card bg-elevated/60 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        How to spot it
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-ink-dim">
                        {sp.identification}
                      </p>
                    </div>
                  ) : null}
                  {sp.strategy ? (
                    <div className="rounded-card bg-elevated/60 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        Strategy
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-ink-dim">
                        {sp.strategy}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 overflow-hidden rounded-card border border-line-subtle">
                {rows.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-muted">
                    No problems linked to this pattern yet.
                  </p>
                ) : (
                  rows.map((p, j) => (
                    <ProblemRow
                      key={p.id}
                      problem={p}
                      index={j + 1}
                      status={catalog.statuses[p.id]}
                      confidence={catalog.confidence[p.id]}
                      reviewedAt={catalog.reviewedAt[p.id]}
                      from={`sp:${sp.id}`}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted">
        Looking for the full list?{" "}
        <Link href="/problems" className="font-semibold text-secondary hover:underline">
          Open all problems →
        </Link>
      </p>
    </>
  );
}
