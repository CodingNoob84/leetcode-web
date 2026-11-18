import { getCatalog } from "@/lib/db/queries";
import { ProblemBrowser } from "@/components/ProblemBrowser";
import { BackLink, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getCatalog();

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Problems"
        subtitle="Search, filter and drill into the shared catalog."
      />
      <ProblemBrowser
        problems={catalog.problems}
        topics={catalog.topics}
        subpatterns={catalog.subpatterns.map((sp) => ({
          id: sp.id,
          topicId: sp.topicId,
          name: sp.name,
          position: sp.position,
        }))}
        problemTopics={catalog.problemTopics}
        problemSubpatterns={catalog.problemSubpatterns}
        statuses={catalog.statuses}
        confidence={catalog.confidence}
        reviewedAt={catalog.reviewedAt}
        initialState={params.state ?? ""}
        initialTopic={params.topic ?? ""}
      />
    </>
  );
}
