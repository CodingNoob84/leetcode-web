import type { Catalog, ProblemDetail } from "@/lib/db/queries";

export const queryKeys = {
  catalog: ["catalog"] as const,
  problem: (id: string) => ["problem", id] as const,
  random: ["random"] as const,
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      res.status === 404 ? "Not found" : `Request failed (${res.status})`,
    );
  }
  return (await res.json()) as T;
}

export function fetchCatalog() {
  return getJson<Catalog>("/api/catalog");
}

export function fetchProblem(id: string) {
  return getJson<ProblemDetail>(`/api/problems/${encodeURIComponent(id)}`);
}
