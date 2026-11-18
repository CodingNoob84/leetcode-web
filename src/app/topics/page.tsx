import Link from "next/link";
import { getCatalog } from "@/lib/db/queries";
import { computeStats } from "@/lib/stats";
import { BackLink, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const catalog = await getCatalog();
  const stats = computeStats({
    problems: catalog.problems,
    statuses: catalog.statuses,
    confidence: catalog.confidence,
    topics: catalog.topics,
    problemTopics: catalog.problemTopics,
  });

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Topics"
        subtitle="Learn pattern by pattern — each topic holds an ordered list of sub-patterns."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.topics.map((t) => {
          const patterns = catalog.subpatterns.filter((sp) => sp.topicId === t.id);
          return (
            <Link
              key={t.id}
              href={`/topics/${t.id}`}
              className="rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
            >
              <div className="flex items-center gap-2">
                <span className="flex-1 truncate text-[15px] font-semibold text-ink">{t.name}</span>
                <span className="text-xs text-muted">
                  {t.solved}/{t.total}
                </span>
              </div>
              <ProgressBar frac={t.total ? t.solved / t.total : 0} />
              <p className="mt-2 text-xs text-muted">
                {patterns.length} pattern{patterns.length === 1 ? "" : "s"}
                {t.avgConfidence != null
                  ? ` · avg confidence ${t.avgConfidence.toFixed(1)}/5`
                  : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
