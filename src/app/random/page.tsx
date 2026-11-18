import { getCatalog } from "@/lib/db/queries";
import {
  availabilityByDifficulty,
  parseRandomFilters,
  randomFrom,
  sampleProblems,
} from "@/lib/random";
import { ProblemRow } from "@/components/ProblemRow";
import { RandomForm } from "@/components/RandomForm";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  mixed: "Mixed",
} as const;

export default async function RandomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseRandomFilters(params);
  const catalog = await getCatalog();

  const results = filters
    ? sampleProblems(catalog.problems, catalog.confidence, filters)
    : [];
  const from = filters ? randomFrom(filters) : undefined;

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Random"
        subtitle="Pick a size, difficulty and confidence level, then generate a fresh set."
      />

      <RandomForm
        initialCount={filters?.count ?? 10}
        initialDifficulty={filters?.difficulty ?? "mixed"}
        initialRating={filters?.rating ?? null}
        availability={availabilityByDifficulty(catalog.problems, catalog.confidence)}
        hasResults={filters != null}
      />

      {filters ? (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Your set
            </h2>
            <p className="text-xs text-muted">
              {results.length}
              {results.length < filters.count ? ` of ${filters.count}` : ""} question
              {results.length === 1 ? "" : "s"} · {DIFFICULTY_LABEL[filters.difficulty]} ·{" "}
              {filters.rating == null ? "Any rating" : `Rated ${filters.rating}`}
            </p>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="No problems match those filters"
              body="Try Mixed difficulty or a lower know rating — exact ratings only match problems you have already rated."
            />
          ) : (
            <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
              {results.map((p, i) => (
                <ProblemRow
                  key={p.id}
                  problem={p}
                  index={i + 1}
                  status={catalog.statuses[p.id]}
                  confidence={catalog.confidence[p.id]}
                  reviewedAt={catalog.reviewedAt[p.id]}
                  from={from}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
