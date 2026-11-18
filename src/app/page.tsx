import Link from "next/link";
import { getCatalog } from "@/lib/db/queries";
import { isDue, LEVELS, nowMs } from "@/lib/learn";
import { computeStats, studyOrder } from "@/lib/stats";
import { Badge, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const catalog = await getCatalog();
  const now = nowMs();

  const stats = computeStats({
    problems: catalog.problems,
    statuses: catalog.statuses,
    confidence: catalog.confidence,
    topics: catalog.topics,
    problemTopics: catalog.problemTopics,
  });

  const pct = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;
  const mastered = Object.values(catalog.confidence).filter((c) => c === 5).length;
  const byLevel = LEVELS.map((l) => ({
    ...l,
    n: Object.values(catalog.confidence).filter((c) => c === l.value).length,
  }));
  const unratedLearned = Math.max(
    0,
    stats.solved - byLevel.reduce((a, b) => a + b.n, 0),
  );

  const dueIds = Object.keys(catalog.confidence)
    .filter((id) => isDue(catalog.confidence[id], catalog.reviewedAt[id], now))
    .sort(
      (a, b) =>
        catalog.confidence[a] - catalog.confidence[b] ||
        catalog.reviewedAt[a] - catalog.reviewedAt[b],
    );

  const ordered = studyOrder(
    catalog.problems,
    catalog.topics,
    catalog.subpatterns,
    catalog.problemSubpatterns,
  );
  const next = ordered.find(
    (p) => !["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[p.id] ?? ""),
  );
  const nextPattern = next
    ? catalog.subpatterns.find((sp) =>
        catalog.problemSubpatterns.some(
          (l) => l.problemId === next.id && l.subpatternId === sp.id,
        ),
      )
    : undefined;

  return (
    <>
      <PageHeader
        title="Keep learning"
        subtitle="Your progress comes straight from the shared Neon database."
      />

      <section className="rounded-panel border border-line-subtle bg-card p-6">
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-ink">
            {stats.solved}
          </span>
          <span className="pb-1 text-base font-semibold text-muted">
            / {stats.total} learned
          </span>
          <span className="pb-1 text-base font-semibold text-primary">{pct}%</span>
        </div>

        <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-elevated">
          {byLevel.map((l) =>
            l.n > 0 ? (
              <span
                key={l.value}
                style={{ flex: l.n, backgroundColor: l.color }}
                className="block h-full"
              />
            ) : null,
          )}
          {unratedLearned > 0 ? (
            <span style={{ flex: unratedLearned }} className="block h-full bg-secondary" />
          ) : null}
          {stats.total - stats.solved > 0 ? (
            <span style={{ flex: stats.total - stats.solved }} className="block h-full" />
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/problems?state=todo"
            className="rounded-card bg-elevated px-4 py-4 text-center transition-colors hover:bg-line-subtle"
          >
            <span className="block text-xl font-bold text-ink">
              {stats.total - stats.solved}
            </span>
            <span className="mt-1 block text-[11px] text-muted">To learn</span>
          </Link>
          <Link
            href="/revisit"
            className="rounded-card bg-elevated px-4 py-4 text-center transition-colors hover:bg-line-subtle"
          >
            <span
              className={`block text-xl font-bold ${dueIds.length > 0 ? "text-warning" : "text-ink"}`}
            >
              {dueIds.length}
            </span>
            <span className="mt-1 block text-[11px] text-muted">Revisit now</span>
          </Link>
          <Link
            href="/mastered"
            className="rounded-card bg-elevated px-4 py-4 text-center transition-colors hover:bg-line-subtle"
          >
            <span className="block text-xl font-bold text-primary">{mastered}</span>
            <span className="mt-1 block text-[11px] text-muted">Mastered</span>
          </Link>
        </div>
      </section>

      {next ? (
        <Link
          href={`/problems/${next.id}`}
          className="mt-6 block rounded-panel border border-primary/40 border-l-4 bg-card p-5 transition-colors hover:bg-elevated/50"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Up next
          </p>
          <p className="mt-1 text-lg font-semibold text-ink">{next.title}</p>
          {nextPattern ? (
            <p className="mt-0.5 text-sm text-muted">{nextPattern.name}</p>
          ) : null}
          <p className="mt-3 text-sm font-semibold text-secondary">Start learning →</p>
        </Link>
      ) : null}

      <h2 className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        Topics
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.topics.map((t) => {
          const ids = catalog.problemTopics
            .filter((l) => l.topicId === t.id)
            .map((l) => l.problemId);
          const dueHere = ids.filter((id) =>
            isDue(catalog.confidence[id], catalog.reviewedAt[id], now),
          ).length;
          const done = t.total > 0 && t.solved === t.total;
          return (
            <Link
              key={t.id}
              href={`/topics/${t.id}`}
              className="rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 truncate text-[15px] font-semibold text-ink">
                  {t.name}
                </span>
                {dueHere > 0 ? <Badge text={`↻ ${dueHere}`} color="var(--color-warning)" /> : null}
                {done ? <Badge text="✓ done" color="var(--color-primary)" /> : null}
                <span className="text-xs text-muted">
                  {t.solved}/{t.total}
                </span>
              </div>
              <ProgressBar frac={t.total ? t.solved / t.total : 0} />
              {t.avgConfidence != null ? (
                <p className="mt-2 text-xs text-muted">
                  Avg confidence {t.avgConfidence.toFixed(1)} / 5
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}
