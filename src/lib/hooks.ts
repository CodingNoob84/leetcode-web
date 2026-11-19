"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCatalog, fetchProblem, queryKeys } from "@/lib/api";

export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalog,
  });
}

export function useProblem(id: string | null) {
  return useQuery({
    queryKey: queryKeys.problem(id ?? ""),
    queryFn: () => fetchProblem(id!),
    enabled: Boolean(id),
  });
}
