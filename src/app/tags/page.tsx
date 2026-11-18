import { getCatalog } from "@/lib/db/queries";
import { TagBrowser } from "@/components/TagBrowser";
import { BackLink, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const LEARNED = ["SOLVED", "REVIEW", "MASTERED"];

export default async function TagsPage() {
  const catalog = await getCatalog();

  const tags = catalog.tags
    .map((tag) => {
      const ids = catalog.problemTags
        .filter((l) => l.tagId === tag.id)
        .map((l) => l.problemId);
      const learned = ids.filter((id) => LEARNED.includes(catalog.statuses[id] ?? "")).length;
      return { ...tag, total: ids.length, learned };
    })
    .filter((t) => t.total > 0);

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Tags"
        subtitle="Cross-cutting themes — islands, parentheses, paths and more — that group similar problems."
      />
      <TagBrowser tags={tags} />
    </>
  );
}
