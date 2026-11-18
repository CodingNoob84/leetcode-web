"use client";

import { useMemo, useState } from "react";
import { ProblemRow, type RowProblem } from "./ProblemRow";
import { isDue, nowMs } from "@/lib/learn";

export interface BrowserProblem extends RowProblem {
  slug: string;
}

export interface BrowserTopic {
  id: string;
  name: string;
  slug: string;
}

export interface BrowserSubpattern {
  id: string;
  topicId: string;
  name: string;
  position: number;
}

const STATES = [
  { key: "", label: "All" },
  { key: "todo", label: "To learn" },
  { key: "learned", label: "Learned" },
  { key: "due", label: "↻ Due" },
] as const;

const DIFFICULTIES = ["", "EASY", "MEDIUM", "HARD"] as const;

export function ProblemBrowser({
  problems,
  topics,
  subpatterns,
  problemTopics,
  problemSubpatterns,
  statuses,
  confidence,
  reviewedAt,
  showTopicFilter = true,
  initialState = "",
  initialTopic = "",
}: {
  problems: BrowserProblem[];
  topics: BrowserTopic[];
  subpatterns: BrowserSubpattern[];
  problemTopics: { problemId: string; topicId: string }[];
  problemSubpatterns: { problemId: string; subpatternId: string }[];
  statuses: Record<string, string>;
  confidence: Record<string, number>;
  reviewedAt: Record<string, number>;
  showTopicFilter?: boolean;
  initialState?: string;
  initialTopic?: string;
}) {
  const [state, setState] = useState<string>(initialState);
  const [difficulty, setDifficulty] = useState<string>("");
  const [topic, setTopic] = useState<string>(initialTopic);
  const [query, setQuery] = useState("");

  const now = nowMs();

  const filtered = useMemo(
    () =>
      problems.filter((p) => {
        if (difficulty && p.difficulty !== difficulty) return false;
        const learned = ["SOLVED", "REVIEW", "MASTERED"].includes(statuses[p.id] ?? "");
        if (state === "todo" && learned) return false;
        if (state === "learned" && !learned) return false;
        if (state === "due" && !isDue(confidence[p.id], reviewedAt[p.id], now)) return false;
        if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
        if (topic) {
          const ids = problemTopics
            .filter((l) => l.problemId === p.id)
            .map((l) => l.topicId);
          if (!ids.some((id) => topics.find((t) => t.id === id)?.slug === topic)) return false;
        }
        return true;
      }),
    [problems, difficulty, state, query, topic, topics, problemTopics, statuses, confidence, reviewedAt, now],
  );

  // With a topic selected, group by subpattern (pattern -> problems).
  const activeTopic = topics.find((t) => t.slug === topic);
  const groups = useMemo(() => {
    if (!activeTopic) return [];
    return subpatterns
      .filter((sp) => sp.topicId === activeTopic.id)
      .map((sp) => ({
        sub: sp,
        rows: filtered.filter((p) =>
          problemSubpatterns.some((l) => l.problemId === p.id && l.subpatternId === sp.id),
        ),
      }))
      .filter((g) => g.rows.length > 0);
  }, [activeTopic, subpatterns, filtered, problemSubpatterns]);

  const chip = (label: string, on: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        on
          ? "border-primary bg-primary/15 text-primary"
          : "border-line bg-card text-muted hover:border-muted hover:text-ink-dim",
      ].join(" ")}
    >
      {label}
    </button>
  );

  const hasFilters = Boolean(query || difficulty || topic || state);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-card border border-line bg-card px-3">
          <span className="text-placeholder">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-placeholder"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="px-1 text-sm font-bold text-muted hover:text-ink"
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATES.map((s) => chip(s.label, state === s.key, () => setState(s.key)))}
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) =>
            chip(d === "" ? "Any level" : d.charAt(0) + d.slice(1).toLowerCase(), difficulty === d, () =>
              setDifficulty(d),
            ),
          )}
        </div>
        {showTopicFilter ? (
          <div className="flex flex-wrap gap-2">
            {chip("All topics", topic === "", () => setTopic(""))}
            {topics.map((t) => chip(t.name, topic === t.slug, () => setTopic(t.slug)))}
          </div>
        ) : null}
      </div>

      <p className="mb-2 text-xs text-muted">{filtered.length} shown</p>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card/60 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-ink-dim">No problems match</p>
          <p className="mt-1 text-xs text-muted">Try a different search or loosen the filters.</p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDifficulty("");
                setTopic("");
                setState("");
              }}
              className="mt-4 rounded-card border border-line px-4 py-2 text-xs font-semibold text-ink-dim hover:bg-elevated"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : groups.length > 0 ? (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.sub.id}>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                {g.sub.name} · {g.rows.length}
              </h3>
              <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
                {g.rows.map((p, i) => (
                  <ProblemRow
                    key={p.id}
                    problem={p}
                    index={i + 1}
                    status={statuses[p.id]}
                    confidence={confidence[p.id]}
                    reviewedAt={reviewedAt[p.id]}
                    from={`sp:${g.sub.id}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
          {filtered.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={statuses[p.id]}
              confidence={confidence[p.id]}
              reviewedAt={reviewedAt[p.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
