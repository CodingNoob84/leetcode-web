import Link from "next/link";
import type { ReactNode } from "react";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

const difficultyMap = {
  EASY: { solid: "#10B981", label: "Easy" },
  MEDIUM: { solid: "#F59E0B", label: "Med" },
  HARD: { solid: "#EF4444", label: "Hard" },
} as const;

export function difficultyBadge(d: string) {
  const { solid, label } = difficultyMap[(d || "EASY") as Difficulty] ?? difficultyMap.EASY;
  return {
    label,
    color: solid,
    backgroundColor: `${solid}1F`,
    borderColor: `${solid}40`,
  };
}

export function DifficultyPill({ d }: { d: string }) {
  const b = difficultyBadge(d);
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold"
      style={{ color: b.color, backgroundColor: b.backgroundColor, borderColor: b.borderColor }}
    >
      {b.label}
    </span>
  );
}

export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold"
      style={{ color, backgroundColor: `${color}22` }}
    >
      {text}
    </span>
  );
}

export function ProgressBar({ frac, color = "var(--color-primary)" }: { frac: number; color?: string }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Hollow = not learned yet; filled with the confidence color once rated. */
export function ConfidenceDot({
  confidence,
  learned,
}: {
  confidence?: number | null;
  learned?: boolean;
}) {
  const colors: Record<number, string> = {
    1: "#EF4444",
    2: "#F97316",
    3: "#F59E0B",
    4: "#84CC16",
    5: "#10B981",
  };
  const fill = confidence ? (colors[confidence] ?? "var(--color-primary)") : learned ? "var(--color-primary)" : "transparent";
  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{
        backgroundColor: fill,
        borderWidth: confidence || learned ? 0 : 1.5,
        borderStyle: "solid",
        borderColor: "var(--color-muted)",
      }}
    />
  );
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-muted ${className}`}>
      {children}
    </h2>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line-subtle bg-card p-4 ${className}`}>{children}</div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card/60 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-dim">{title}</p>
      {body ? <p className="mx-auto mt-1 max-w-sm text-xs text-muted">{body}</p> : null}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink-dim"
    >
      ← {children}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}
