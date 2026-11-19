"use client";

import { useMemo, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteSolution, saveSolution, setPreferredSolution } from "@/app/actions";
import { queryKeys } from "@/lib/api";
import { CodeBlock } from "./CodeBlock";
import { RatingButtons } from "./RatingButtons";

export interface SolutionView {
  id: string;
  name: string;
  code: string;
  explanation: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  isPreferred: boolean;
}

export function SolutionWorkspace({
  problemId,
  solutions,
  template,
  confidence,
}: {
  problemId: string;
  solutions: SolutionView[];
  template: string | null;
  confidence?: number | null;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(solutions[0]?.id ?? null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    code: "",
    explanation: "",
    time: "",
    space: "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeMode, setCodeMode] = useState<"edit" | "preview">("edit");

  const selected = useMemo(
    () => solutions.find((x) => x.id === selectedId) ?? solutions[0],
    [solutions, selectedId],
  );

  const openEditor = (id: string | "new") => {
    setError(null);
    if (id === "new") {
      setDraft({
        name: `Solution ${solutions.length + 1}`,
        code: template ?? "",
        explanation: "",
        time: "",
        space: "",
      });
    } else {
      const s = solutions.find((x) => x.id === id);
      setDraft({
        name: s?.name ?? "",
        code: s?.code ?? "",
        explanation: s?.explanation ?? "",
        time: s?.timeComplexity ?? "",
        space: s?.spaceComplexity ?? "",
      });
    }
    setEditing(id);
    setSaved(false);
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveSolution({
          problemId,
          solutionId: editing === "new" ? null : editing,
          name: draft.name.trim() || "Solution",
          code: draft.code,
          explanation: draft.explanation.trim() || null,
          timeComplexity: draft.time.trim() || null,
          spaceComplexity: draft.space.trim() || null,
        });
        // Saved: go straight back to the solutions list and confirm there.
        setSelectedId(result.solutionId);
        setEditing(null);
        setSaved(true);
        await queryClient.invalidateQueries({ queryKey: queryKeys.problem(problemId) });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const remove = (id: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteSolution(problemId, id);
        if (selectedId === id) setSelectedId(solutions.find((x) => x.id !== id)?.id ?? null);
        await queryClient.invalidateQueries({ queryKey: queryKeys.problem(problemId) });
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (editing) {
    return (
      <div className="rounded-card border border-line-subtle bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">
            {editing === "new" ? "New solution" : "Edit solution"}
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setSaved(false);
            }}
            className="text-xs font-semibold text-muted hover:text-ink-dim"
          >
            Cancel
          </button>
        </div>

        <input
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Name, e.g. Hash map · O(n)"
          maxLength={120}
          className="mb-3 w-full rounded-card border border-line bg-code/60 px-3 py-2.5 text-sm text-ink outline-none focus:border-primary placeholder:text-placeholder"
        />

        <div className="mb-2 flex items-center gap-2">
          {(["edit", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCodeMode(mode)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                codeMode === mode
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-line text-muted hover:border-muted hover:text-ink-dim",
              ].join(" ")}
            >
              {mode === "edit" ? "Edit" : "Highlighted preview"}
            </button>
          ))}
        </div>

        {codeMode === "edit" ? (
          <textarea
            value={draft.code}
            onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
            placeholder={"def solve(nums):\n    ..."}
            spellCheck={false}
            rows={14}
            className="w-full resize-y rounded-card border border-line bg-code p-3 font-mono text-[13px] leading-6 text-ink-dim outline-none focus:border-primary placeholder:text-placeholder"
          />
        ) : (
          <CodeBlock code={draft.code} />
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">
              Time
            </span>
            <input
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              placeholder="O(n)"
              className="w-full rounded-card border border-line bg-code/60 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-primary placeholder:text-placeholder"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">
              Space
            </span>
            <input
              value={draft.space}
              onChange={(e) => setDraft((d) => ({ ...d, space: e.target.value }))}
              placeholder="O(1)"
              className="w-full rounded-card border border-line bg-code/60 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-primary placeholder:text-placeholder"
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">
            Approach — explain it to future you
          </span>
          <textarea
            value={draft.explanation}
            onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
            placeholder="Key idea, why it works, edge cases…"
            rows={5}
            className="w-full resize-y rounded-card border border-line bg-code/60 px-3 py-2.5 text-[13.5px] leading-6 text-ink-dim outline-none focus:border-primary placeholder:text-placeholder"
          />
        </label>

        {error ? <p className="mt-3 text-xs text-danger">{error}</p> : null}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-card bg-primary px-4 py-2 text-xs font-bold text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save solution"}
          </button>
          <span className="text-[11px] text-placeholder">
            Saved to Neon · the mobile app picks it up on its next sync.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {saved ? (
        <div className="mb-3 rounded-card border border-primary/40 bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary">Solution saved</p>
              <p className="mt-1 text-[13px] leading-5 text-ink-dim">
                Rate how well you know it now — 1–5 schedules the next revisit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaved(false)}
              aria-label="Dismiss"
              className="text-xs font-bold text-muted hover:text-ink"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 max-w-sm">
            <RatingButtons problemId={problemId} confidence={confidence} compact />
          </div>
        </div>
      ) : null}

      {solutions.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {solutions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSelectedId(s.id);
              }}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                s.id === selected?.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-line bg-card text-muted hover:border-muted hover:text-ink-dim",
              ].join(" ")}
            >
              {s.isPreferred ? "★ " : ""}
              {s.name}
            </button>
          ))}
        </div>
      ) : null}

      {selected ? (
        <div className="rounded-card border border-line-subtle bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex-1 truncate text-sm font-semibold text-ink">
              {selected.isPreferred ? "★ " : ""}
              {selected.name}
            </h3>
            <button
              type="button"
              onClick={() => void copy()}
              className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold text-ink-dim hover:bg-elevated"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => openEditor(selected.id)}
              className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold text-ink-dim hover:bg-elevated"
            >
              Edit
            </button>
            {!selected.isPreferred ? (
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await setPreferredSolution(problemId, selected.id);
                    await queryClient.invalidateQueries({
                      queryKey: queryKeys.problem(problemId),
                    });
                  })
                }
                className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-elevated hover:text-ink-dim"
              >
                ★ Prefer
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => remove(selected.id)}
              className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-danger/50 hover:text-danger"
            >
              Delete
            </button>
          </div>

          <CodeBlock code={selected.code} />
          {selected.timeComplexity || selected.spaceComplexity ? (
            <div className="mt-3 flex gap-2">
              {selected.timeComplexity ? (
                <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-bold text-secondary">
                  Time {selected.timeComplexity}
                </span>
              ) : null}
              {selected.spaceComplexity ? (
                <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-bold text-secondary">
                  Space {selected.spaceComplexity}
                </span>
              ) : null}
            </div>
          ) : null}
          {selected.explanation ? (
            <>
              <h4 className="mb-1.5 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Approach
              </h4>
              <p className="whitespace-pre-wrap text-[13.5px] leading-6 text-ink-dim">
                {selected.explanation}
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openEditor("new")}
          className="w-full rounded-card border border-dashed border-line bg-card/60 px-6 py-10 text-sm font-semibold text-secondary hover:border-secondary/50"
        >
          + Write or paste your first solution
        </button>
      )}

      {selected ? (
        <button
          type="button"
          onClick={() => openEditor("new")}
          className="mt-3 text-xs font-semibold text-secondary hover:underline"
        >
          + Add solution
        </button>
      ) : null}

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
