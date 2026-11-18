// Learning model (port of leetcode-app/src/learn.ts): rating a problem 1–5
// marks it learned and schedules the next revisit (simple spaced repetition).
// 1 = revisit again and again, 5 = mastered, never comes back.
export const DAY = 24 * 60 * 60 * 1000;

/** Current time, wrapped so React's purity lint rule stays happy in render. */
export const nowMs = () => Date.now();

export const LEVELS = [
  { value: 1, label: "Again", days: 1, color: "#EF4444" },
  { value: 2, label: "Hard", days: 3, color: "#F97316" },
  { value: 3, label: "Okay", days: 7, color: "#F59E0B" },
  { value: 4, label: "Good", days: 21, color: "#84CC16" },
  { value: 5, label: "Mastered", days: null, color: "#10B981" },
] as const;

export type Level = (typeof LEVELS)[number];

export function level(confidence: number | null | undefined): Level | null {
  return LEVELS.find((l) => l.value === confidence) ?? null;
}

/** ms epoch when the problem is due again; null = never (or unrated). */
export function dueAt(
  confidence: number | null | undefined,
  reviewedAt: number | null | undefined,
) {
  const l = level(confidence);
  if (!l || l.days === null || !reviewedAt) return null;
  return reviewedAt + l.days * DAY;
}

export function isDue(
  confidence: number | null | undefined,
  reviewedAt: number | null | undefined,
  now = Date.now(),
) {
  const d = dueAt(confidence, reviewedAt);
  return d !== null && d <= now;
}

export function scheduleText(confidence: number | null | undefined) {
  const l = level(confidence);
  if (!l) return "Rate it once you've understood the solution.";
  if (l.days === null) return "Mastered — no revisit needed.";
  if (l.days === 1) return "Comes back tomorrow.";
  if (l.days === 7) return "Comes back in 1 week.";
  if (l.days === 21) return "Comes back in 3 weeks.";
  return `Comes back in ${l.days} days.`;
}

export function relativeDue(at: number | null, now = Date.now()) {
  if (at === null) return "";
  const days = Math.ceil((at - now) / DAY);
  if (days <= 0) return "due now";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

export function ago(ts: number | null | undefined, now = Date.now()) {
  if (!ts) return "";
  const m = Math.round((now - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export const isLearned = (status?: string) =>
  ["SOLVED", "REVIEW", "MASTERED"].includes(status ?? "");
