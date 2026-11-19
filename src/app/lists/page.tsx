"use client";

import Link from "next/link";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";

export default function ListsPage() {
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading lists…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load lists.</p>;
  }

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
