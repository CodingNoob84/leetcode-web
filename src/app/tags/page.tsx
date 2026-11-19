"use client";

import { TagBrowser } from "@/components/TagBrowser";
import { BackLink, PageHeader } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";

const LEARNED = ["SOLVED", "REVIEW", "MASTERED"];

export default function TagsPage() {
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading tags…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load tags.</p>;
  }

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
