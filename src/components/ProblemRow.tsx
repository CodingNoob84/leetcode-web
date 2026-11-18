import Link from "next/link";
import { ConfidenceDot, DifficultyPill } from "./ui";
import { isDue, level } from "@/lib/learn";

export interface RowProblem {
  id: string;
  title: string;
  difficulty: string;
}

export function ProblemRow({
  problem,
  status,
  confidence,
  reviewedAt,
  index,
  from,
}: {
  problem: RowProblem;
  status?: string;
  confidence?: number;
  reviewedAt?: number;
  index?: number;
  from?: string;
}) {
  const due = isDue(confidence, reviewedAt);
  const lvl = level(confidence);
  const learned = ["SOLVED", "REVIEW", "MASTERED"].includes(status ?? "");
  const href = `/problems/${problem.id}${from ? `?from=${encodeURIComponent(from)}` : ""}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 transition-colors last:border-b-0 hover:bg-elevated/60"
    >
      {index != null ? (
        <span className="w-6 shrink-0 text-xs text-placeholder">{index}</span>
      ) : null}
      <ConfidenceDot confidence={confidence} learned={learned} />
      <span
        className={`flex-1 truncate text-sm ${
          learned ? "font-medium text-ink-dim" : "font-semibold text-ink"
        }`}
      >
        {problem.title}
      </span>
      {due ? (
        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10.5px] font-bold text-warning">
          ↻ due
        </span>
      ) : lvl ? (
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
          style={{ color: lvl.color, backgroundColor: `${lvl.color}22` }}
        >
          {lvl.label}
        </span>
      ) : null}
      <DifficultyPill d={problem.difficulty} />
    </Link>
  );
}
