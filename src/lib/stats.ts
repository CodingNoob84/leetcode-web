// Dashboard aggregates over the catalog rows (port of
// leetcode-app/lib/db/stats.ts). Single-user scale: everything is computed in JS.
export interface StatsInput {
  problems: { id: string }[];
  statuses: Record<string, string>;
  /** Self-rated confidence 1-5 per problem (absent = unrated). */
  confidence: Record<string, number>;
  topics: { id: string; name: string }[];
  problemTopics: { problemId: string; topicId: string }[];
}

export interface TopicStat {
  id: string;
  name: string;
  total: number;
  solved: number;
  /** Mean over rated problems only; null when none are rated. */
  avgConfidence: number | null;
}

export interface DashboardStats {
  total: number;
  solved: number;
  topics: TopicStat[];
}

const SOLVED = ["SOLVED", "REVIEW", "MASTERED"];

export function computeStats(s: StatsInput): DashboardStats {
  const isSolved = (id: string) => SOLVED.includes(s.statuses[id] ?? "");
  const avgOf = (ids: string[]): number | null => {
    const vals = ids
      .map((id) => s.confidence[id])
      .filter((c): c is number => typeof c === "number");
    if (vals.length === 0) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  };
  return {
    total: s.problems.length,
    solved: s.problems.filter((p) => isSolved(p.id)).length,
    topics: s.topics.map((t) => {
      const ids = s.problemTopics.filter((l) => l.topicId === t.id).map((l) => l.problemId);
      return { ...t, total: ids.length, solved: ids.filter(isSolved).length, avgConfidence: avgOf(ids) };
    }),
  };
}

/** Problems in study order: topic -> pattern position -> title. */
export function studyOrder(
  problems: { id: string; title: string }[],
  topics: { id: string }[],
  subpatterns: { id: string; topicId: string; position: number }[],
  problemSubpatterns: { problemId: string; subpatternId: string }[],
) {
  const rank = new Map<string, number>();
  const topicIdx = new Map(topics.map((t, i) => [t.id, i]));
  for (const sp of subpatterns) {
    const r = (topicIdx.get(sp.topicId) ?? 99) * 1000 + sp.position;
    for (const l of problemSubpatterns) {
      if (l.subpatternId === sp.id && !rank.has(l.problemId)) rank.set(l.problemId, r);
    }
  }
  return [...problems].sort(
    (a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9) || a.title.localeCompare(b.title),
  );
}
