import Link from "next/link";
import { getCatalog } from "@/lib/db/queries";
import { dueAt, isDue, level, nowMs, relativeDue } from "@/lib/learn";
import { BackLink, DifficultyPill, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RevisitPage() {
  const catalog = await getCatalog();
  const now = nowMs();
  const byId = new Map(catalog.problems.map((p) => [p.id, p]));

  const due = Object.keys(catalog.confidence)
    .filter((id) => isDue(catalog.confidence[id], catalog.reviewedAt[id], now))
    .sort(
      (a, b) =>
        catalog.confidence[a] - catalog.confidence[b] ||
        catalog.reviewedAt[a] - catalog.reviewedAt[b],
    );

  const upcoming = Object.keys(catalog.confidence)
    .map((id) => ({ id, at: dueAt(catalog.confidence[id], catalog.reviewedAt[id]) }))
    .filter((x): x is { id: string; at: number } => x.at !== null && x.at > now)
    .sort((a, b) => a.at - b.at);

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Revisit"
        subtitle={`${due.length + upcoming.length} in rotation · ${due.length} due now · ${upcoming.length} coming up`}
      />
      <p className="-mt-4 mb-6 text-sm text-muted">
        Re-solve it in your head, peek at the solution, then re-rate it.
      </p>

      {due.length > 0 ? (
        <Link
          href={`/problems/${due[0]}`}
          className="mb-6 block rounded-card bg-primary px-4 py-3 text-center text-sm font-bold text-canvas transition-opacity hover:opacity-90"
        >
          Start revisiting · {due.length} due
        </Link>
      ) : null}

      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        Due now ({due.length})
      </h2>
      <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
        {due.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-dim">
            All caught up 🎉 Nothing to revisit right now.
          </p>
        ) : (
          due.map((id, i) => {
            const p = byId.get(id);
            if (!p) return null;
            return (
              <Link
                key={id}
                href={`/problems/${p.id}`}
                className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-elevated/60"
              >
                <span className="w-6 shrink-0 text-xs text-placeholder">{i + 1}</span>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: level(catalog.confidence[id])?.color ?? "var(--color-muted)" }}
                />
                <span className="flex-1 truncate text-sm text-ink-dim">{p.title}</span>
                <span className="text-xs text-warning">↻ due</span>
                <DifficultyPill d={p.difficulty} />
              </Link>
            );
          })
        )}
      </div>

      {upcoming.length > 0 ? (
        <>
          <h2 className="mb-2 mt-8 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Coming up ({upcoming.length})
          </h2>
          <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
            {upcoming.map(({ id, at }) => {
              const p = byId.get(id);
              if (!p) return null;
              const l = level(catalog.confidence[id]);
              return (
                <Link
                  key={id}
                  href={`/problems/${p.id}`}
                  className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-elevated/60"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: l?.color ?? "var(--color-muted)" }}
                  />
                  <span className="flex-1 truncate text-sm text-ink-dim">{p.title}</span>
                  <span className="text-xs text-muted">{relativeDue(at, now)}</span>
                  <DifficultyPill d={p.difficulty} />
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </>
  );
}
