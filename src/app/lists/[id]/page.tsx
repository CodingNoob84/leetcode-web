import { notFound } from "next/navigation";
import { getList } from "@/lib/db/queries";
import { getCatalog } from "@/lib/db/queries";
import { ProblemRow } from "@/components/ProblemRow";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listData, catalog] = await Promise.all([getList(id), getCatalog()]);
  if (!listData) notFound();
  const { list, problems } = listData;

  const learnedCount = problems.filter(
    (p) => ["SOLVED", "REVIEW", "MASTERED"].includes(catalog.statuses[p.id] ?? ""),
  ).length;

  return (
    <>
      <BackLink href="/lists">All lists</BackLink>
      <PageHeader
        title={list.name}
        subtitle={`${problems.length} problems · ${learnedCount} learned`}
      />
      {list.description ? (
        <p className="-mt-4 mb-6 text-sm text-muted">{list.description}</p>
      ) : null}

      <div className="mb-4 max-w-sm">
        <ProgressBar frac={problems.length ? learnedCount / problems.length : 0} />
      </div>

      <div className="overflow-hidden rounded-card border border-line-subtle bg-card">
        {problems.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">This list is empty</p>
        ) : (
          problems.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i + 1}
              status={catalog.statuses[p.id]}
              confidence={catalog.confidence[p.id]}
              reviewedAt={catalog.reviewedAt[p.id]}
              from={`list:${list.id}`}
            />
          ))
        )}
      </div>
    </>
  );
}
