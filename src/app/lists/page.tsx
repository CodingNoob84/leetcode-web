import Link from "next/link";
import { getCatalog } from "@/lib/db/queries";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const catalog = await getCatalog();

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Study Lists"
        subtitle="Curated tracks from the database, never hard-coded."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {catalog.lists.map((l) => {
          const ids = catalog.listEntries
            .filter((e) => e.listId === l.id)
            .map((e) => e.problemId);
          const solved = ids.filter(
            (pid) => ["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[pid] ?? ""),
          ).length;
          return (
            <Link
              key={l.id}
              href={`/lists/${l.id}`}
              className="rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
            >
              <p className="text-[15px] font-semibold text-ink">{l.name}</p>
              {l.description ? (
                <p className="mt-1 text-xs leading-5 text-muted">{l.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted">
                {solved} / {ids.length} learned
              </p>
              <ProgressBar frac={ids.length ? solved / ids.length : 0} />
            </Link>
          );
        })}
      </div>
      {catalog.lists.length === 0 ? (
        <p className="text-sm text-muted">No curated lists in the database yet.</p>
      ) : null}
    </>
  );
}
