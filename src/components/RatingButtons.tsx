"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { rateProblem } from "@/app/actions";
import { queryKeys } from "@/lib/api";
import { LEVELS, scheduleText } from "@/lib/learn";

// Rating 1-5 with instant feedback: the button lights up immediately and the
// React Query caches are invalidated after the write so every page refreshes.
export function RatingButtons({
  problemId,
  confidence,
  compact = false,
}: {
  problemId: string;
  confidence?: number | null;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState<number | null>(confidence ?? null);
  const [synced, setSynced] = useState<number | null>(confidence ?? null);
  const [error, setError] = useState<string | null>(null);

  // Pick up a rating that came from the server (reset after a refresh).
  if (synced !== (confidence ?? null)) {
    setSynced(confidence ?? null);
    setLocal(confidence ?? null);
  }

  const rate = (value: number) => {
    setError(null);
    setLocal(value);
    startTransition(async () => {
      try {
        await rateProblem({ problemId, confidence: value });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.catalog }),
          queryClient.invalidateQueries({ queryKey: queryKeys.problem(problemId) }),
        ]);
      } catch (e) {
        setLocal(confidence ?? null);
        setError((e as Error).message);
      }
    });
  };

  return (
    <div>
      <div className="flex gap-2">
        {LEVELS.map((level) => {
          const on = local === level.value;
          return (
            <button
              key={level.value}
              type="button"
              disabled={pending}
              onClick={() => rate(level.value)}
              title={level.label}
              className={[
                compact
                  ? "flex-1 rounded-card border px-1 py-1.5 text-center transition-colors disabled:opacity-60"
                  : "flex-1 rounded-card border px-2 py-2.5 text-center transition-colors disabled:opacity-60",
                on ? "" : "border-line hover:border-muted",
              ].join(" ")}
              style={on ? { backgroundColor: level.color, borderColor: level.color } : undefined}
            >
              <span
                className={compact ? "block text-sm font-extrabold" : "block text-lg font-extrabold"}
                style={{ color: on ? "var(--color-canvas)" : level.color }}
              >
                {level.value}
              </span>
              <span
                className={compact ? "mt-0.5 block text-[10px]" : "mt-0.5 block text-[10.5px]"}
                style={{
                  color: on ? "var(--color-canvas)" : "var(--color-muted)",
                  fontWeight: on ? 700 : 500,
                }}
              >
                {level.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[11.5px] text-placeholder">{scheduleText(local)}</p>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
