"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { saveNote } from "@/app/actions";
import { queryKeys } from "@/lib/api";

export function NotesEditor({ problemId, initial }: { problemId: string; initial: string }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = content.trim() !== initial.trim();

  const save = () => {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      try {
        await saveNote({ problemId, content });
        await queryClient.invalidateQueries({ queryKey: queryKeys.problem(problemId) });
        setSaved("Saved");
        setTimeout(() => setSaved(null), 2000);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <div className="rounded-card border border-line-subtle bg-card p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Key idea, edge cases, what you got wrong…"
        rows={6}
        className="w-full resize-y rounded-card border border-line bg-code/60 p-3 text-[13.5px] leading-6 text-ink outline-none transition-colors focus:border-primary placeholder:text-placeholder"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-card bg-primary px-4 py-2 text-xs font-bold text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save note"}
        </button>
        {dirty && !pending ? (
          <button
            type="button"
            onClick={() => setContent(initial)}
            className="text-xs font-semibold text-muted hover:text-ink-dim"
          >
            Discard
          </button>
        ) : null}
        {saved ? <span className="text-xs font-semibold text-primary">{saved}</span> : null}
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    </div>
  );
}
