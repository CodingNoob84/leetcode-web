import Link from "next/link";

export interface PagerItem {
  id: string;
  title: string;
}

/**
 * Prev/Next within the sequence the reader came from: a curated list, a
 * subpattern, or the default study order. `from` is round-tripped in the links
 * so the context survives moving between problems.
 */
export function ProblemPager({
  items,
  currentId,
  from,
  className = "",
}: {
  items: PagerItem[];
  currentId: string;
  from?: string;
  className?: string;
}) {
  const pos = items.findIndex((x) => x.id === currentId);
  if (pos < 0) return null;

  const prev = pos > 0 ? items[pos - 1]! : null;
  const next = pos < items.length - 1 ? items[pos + 1]! : null;
  const href = (id: string) =>
    `/problems/${id}${from ? `?from=${encodeURIComponent(from)}` : ""}`;

  return (
    <nav className={`flex items-center gap-3 border-t border-line-subtle pt-4 ${className}`}>
      {prev ? (
        <Link
          href={href(prev.id)}
          className="min-w-0 flex-1 rounded-card border border-line px-4 py-2.5 transition-colors hover:bg-elevated"
        >
          <span className="block text-xs font-bold text-ink-dim">‹ Prev</span>
          <span className="block truncate text-[11.5px] text-muted">{prev.title}</span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      <span className="shrink-0 text-xs font-bold text-ink">
        {pos + 1} / {items.length}
      </span>
      {next ? (
        <Link
          href={href(next.id)}
          className="min-w-0 flex-1 rounded-card border border-primary/60 bg-primary/10 px-4 py-2.5 text-right transition-colors hover:bg-primary/20"
        >
          <span className="block text-xs font-bold text-primary">Next ›</span>
          <span className="block truncate text-[11.5px] text-muted">{next.title}</span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
