import type { ProblemExample } from "@/lib/db/schema";

const MAX_CHARS = 400;

/** One-line, LeetCode-style rendering: `nums = [2,7,11], target = 9`. */
function compact(value: unknown): string {
  if (value == null) return "null";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return compact(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.map(compact).join(", ")}]`;
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key} = ${compact(item)}`)
      .join(", ");
  }
  return String(value);
}

function truncate(text: string) {
  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}…` : text;
}

export function Examples({ examples }: { examples: ProblemExample[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-card border border-line-subtle bg-card">
      {examples.map((example, i) => (
        <div
          key={i}
          className={i < examples.length - 1 ? "border-b border-line-subtle" : ""}
        >
          <div className="px-4 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
              Example {i + 1}
            </span>
          </div>

          <dl className="space-y-1 px-4 py-2.5">
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 pt-px font-mono text-[12px] text-placeholder">
                Input
              </dt>
              <dd className="min-w-0 flex-1 break-words font-mono text-[12.5px] leading-5 text-ink-dim">
                {truncate(compact(example.input))}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 pt-px font-mono text-[12px] text-placeholder">
                Output
              </dt>
              <dd className="min-w-0 flex-1 break-words font-mono text-[12.5px] leading-5 text-primary">
                {truncate(compact(example.output))}
              </dd>
            </div>
          </dl>

          {example.explanation ? (
            <p className="px-4 pb-3 text-[12.5px] leading-5 text-muted">
              {example.explanation}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
