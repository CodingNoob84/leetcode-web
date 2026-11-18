"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import type {
  RandomCount,
  RandomDifficulty,
  RatingAvailability,
} from "@/lib/random";
import { RANDOM_COUNTS, ratingAvailability } from "@/lib/random";

const COUNTS: RandomCount[] = [...RANDOM_COUNTS];
const DIFFICULTIES: { key: RandomDifficulty; label: string }[] = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
  { key: "mixed", label: "Mixed" },
];
const RATINGS = [1, 2, 3, 4, 5];

function chip(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "border-primary bg-primary/15 text-primary"
      : "border-line bg-card text-muted hover:border-muted hover:text-ink-dim"
  }`;
}

export function RandomForm({
  initialCount,
  initialDifficulty,
  initialRating,
  availability,
  hasResults,
}: {
  initialCount: RandomCount;
  initialDifficulty: RandomDifficulty;
  initialRating: number | null;
  availability: RatingAvailability;
  hasResults: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState<RandomCount>(initialCount);
  const [difficulty, setDifficulty] = useState<RandomDifficulty>(initialDifficulty);
  const [rating, setRating] = useState<number | null>(initialRating);

  const counts = availability[difficulty].counts;
  const total = availability[difficulty].total;

  function chooseDifficulty(next: RandomDifficulty) {
    setDifficulty(next);
    if (rating != null && (availability[next].counts[rating] ?? 0) === 0) {
      setRating(null);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      count: String(count),
      difficulty,
      rating: rating == null ? "any" : String(rating),
      seed: String(Math.floor(Math.random() * 1_000_000_000)),
    });
    router.push(`/random?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-line-subtle bg-card p-5"
    >
      <fieldset>
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Questions
        </legend>
        <div className="flex flex-wrap gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={count === n}
              onClick={() => setCount(n)}
              className={chip(count === n)}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Difficulty
        </legend>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={difficulty === d.key}
              onClick={() => chooseDifficulty(d.key)}
              className={chip(difficulty === d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Know rating
        </legend>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={rating == null}
            onClick={() => setRating(null)}
            className={chip(rating == null)}
          >
            Any
          </button>
          {RATINGS.map((r) => {
            const available = counts[r] ?? 0;
            return (
              <button
                key={r}
                type="button"
                aria-pressed={rating === r}
                onClick={() => setRating(r)}
                disabled={available === 0}
                title={`${available} problem${available === 1 ? "" : "s"} available`}
                className={`${chip(rating === r)} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {r}
                <span className="ml-1.5 text-[10px] opacity-60">{available}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {total} problem{total === 1 ? "" : "s"} match this difficulty
          {rating == null ? " · any rating" : ` · rated ${rating}`}.
        </p>
      </fieldset>

      <button
        type="submit"
        className="mt-6 w-full rounded-card bg-primary px-4 py-2.5 text-sm font-bold text-canvas transition-opacity hover:opacity-90 sm:w-auto sm:px-6"
      >
        {hasResults ? "Shuffle again" : "Generate questions"}
      </button>
    </form>
  );
}
