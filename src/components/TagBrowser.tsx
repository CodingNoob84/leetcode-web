"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProgressBar } from "./ui";

export interface BrowserTag {
  id: string;
  name: string;
  description: string | null;
  total: number;
  learned: number;
}

const SORTS = [
  { key: "count", label: "Most problems" },
  { key: "az", label: "A–Z" },
  { key: "za", label: "Z–A" },
  { key: "fewest", label: "Fewest problems" },
  { key: "learned", label: "Most learned" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function TagBrowser({ tags }: { tags: BrowserTag[] }) {
  const [sort, setSort] = useState<SortKey>("count");

  const sorted = useMemo(() => {
    const rows = [...tags];
    switch (sort) {
      case "az":
        return rows.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return rows.sort((a, b) => b.name.localeCompare(a.name));
      case "fewest":
        return rows.sort((a, b) => a.total - b.total || a.name.localeCompare(b.name));
      case "learned":
        return rows.sort(
          (a, b) =>
            b.learned - a.learned || b.total - a.total || a.name.localeCompare(b.name),
        );
      default:
        return rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }
  }, [tags, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sort === s.key
                ? "border-primary bg-primary/15 text-primary"
                : "border-line bg-card text-muted hover:border-muted hover:text-ink-dim",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((t) => (
          <Link
            key={t.id}
            href={`/tags/${t.id}`}
            className="rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate text-[15px] font-semibold text-ink">{t.name}</span>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-[11px] font-bold text-muted">
                {t.total}
              </span>
            </div>
            {t.description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{t.description}</p>
            ) : null}
            <ProgressBar frac={t.total ? t.learned / t.total : 0} />
            <p className="mt-2 text-xs text-muted">
              {t.learned}/{t.total} learned
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
