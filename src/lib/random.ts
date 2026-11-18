import type { CatalogProblem } from "@/lib/db/queries";

export const RANDOM_COUNTS = [10, 20, 30] as const;
export type RandomCount = (typeof RANDOM_COUNTS)[number];
export type RandomDifficulty = "easy" | "medium" | "hard" | "mixed";

export interface RandomFilters {
  count: RandomCount;
  difficulty: RandomDifficulty;
  /** Exact confidence rating 1-5, or null for any. */
  rating: number | null;
  seed: number;
}

const DIFFICULTIES: RandomDifficulty[] = ["easy", "medium", "hard", "mixed"];

function toParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Read a result set from the URL. Returns null when the setup is incomplete. */
export function parseRandomFilters(
  params: Record<string, string | string[] | undefined>,
): RandomFilters | null {
  const count = Number(toParam(params.count));
  if (!RANDOM_COUNTS.includes(count as RandomCount)) return null;

  const difficultyRaw = toParam(params.difficulty) ?? "mixed";
  const difficulty = (DIFFICULTIES.includes(difficultyRaw as RandomDifficulty)
    ? difficultyRaw
    : "mixed") as RandomDifficulty;

  const ratingRaw = toParam(params.rating) ?? "any";
  let rating: number | null = null;
  if (ratingRaw !== "any") {
    const parsed = Number(ratingRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return null;
    rating = parsed;
  }

  const seed = Number(toParam(params.seed));
  if (!Number.isInteger(seed) || seed < 0) return null;

  return { count: count as RandomCount, difficulty, rating, seed };
}

export function randomHref(f: RandomFilters, overrides: Partial<RandomFilters> = {}) {
  const merged = { ...f, ...overrides };
  const params = new URLSearchParams({
    count: String(merged.count),
    difficulty: merged.difficulty,
    rating: merged.rating == null ? "any" : String(merged.rating),
    seed: String(merged.seed),
  });
  return `/random?${params.toString()}`;
}

/** Encodes the result set into the problem pager's `from` parameter. */
export function randomFrom(f: RandomFilters) {
  return `random:${f.count}:${f.difficulty}:${f.rating ?? "any"}:${f.seed}`;
}

export function parseRandomFrom(from: string): RandomFilters | null {
  const match = /^random:(\d+):(easy|medium|hard|mixed):(any|[1-5]):(\d+)$/.exec(from);
  if (!match) return null;
  const count = Number(match[1]);
  if (!RANDOM_COUNTS.includes(count as RandomCount)) return null;
  return {
    count: count as RandomCount,
    difficulty: match[2] as RandomDifficulty,
    rating: match[3] === "any" ? null : Number(match[3]),
    seed: Number(match[4]),
  };
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic seeded sample so refresh/back shows the same question set. */
export function sampleProblems(
  problems: CatalogProblem[],
  confidence: Record<string, number>,
  filters: RandomFilters,
): CatalogProblem[] {
  const target = filters.difficulty.toUpperCase();
  const pool = problems.filter((p) => {
    if (filters.difficulty !== "mixed" && p.difficulty !== target) return false;
    if (filters.rating != null && confidence[p.id] !== filters.rating) return false;
    return true;
  });

  const rand = mulberry32(filters.seed);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, filters.count);
}

export type RatingAvailability = Record<
  RandomDifficulty,
  { total: number; counts: Record<number, number> }
>;

/** Availability for every difficulty, so the form can show live counts. */
export function availabilityByDifficulty(
  problems: CatalogProblem[],
  confidence: Record<string, number>,
): RatingAvailability {
  return {
    easy: ratingAvailability(problems, confidence, "easy"),
    medium: ratingAvailability(problems, confidence, "medium"),
    hard: ratingAvailability(problems, confidence, "hard"),
    mixed: ratingAvailability(problems, confidence, "mixed"),
  };
}

/** Counts per rating for the current difficulty, shown under the rating options. */
export function ratingAvailability(
  problems: CatalogProblem[],
  confidence: Record<string, number>,
  difficulty: RandomDifficulty,
) {
  const target = difficulty.toUpperCase();
  const pool = problems.filter(
    (p) => difficulty === "mixed" || p.difficulty === target,
  );
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const p of pool) {
    const c = confidence[p.id];
    if (c != null && counts[c] !== undefined) counts[c] += 1;
  }
  return { total: pool.length, counts };
}
