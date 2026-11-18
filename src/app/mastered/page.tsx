import { getCatalog } from "@/lib/db/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MasteredPage() {
  const catalog = await getCatalog();
  const mastered = catalog.problems.filter((p) => catalog.confidence[p.id] === 5);

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Mastered"
        subtitle="Problems you rated 5 — they will not come back."
      />
      {mastered.length === 0 ? (
        <EmptyState
          title="Nothing mastered yet"
          body="Rate a problem 5 on its page once it sticks — it lands here."
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
          {mastered.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={catalog.statuses[p.id]}
              confidence={catalog.confidence[p.id]}
              reviewedAt={catalog.reviewedAt[p.id]}
            />
          ))}
        </div>
      )}
    </>
  );
}
