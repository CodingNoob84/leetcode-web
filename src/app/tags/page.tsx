"use client";

import { TagBrowser } from "@/components/TagBrowser";
import { BackLink, PageHeader } from "@/components/ui";
import { useCatalog } from "@/lib/hooks";
import { deriveSpecificTags } from "@/lib/tags";

const LEARNED = ["SOLVED", "REVIEW", "MASTERED"];

export default function TagsPage() {
  const { data: catalog, isPending, error } = useCatalog();

  if (isPending) {
    return <p className="py-16 text-center text-sm text-muted">Loading tags…</p>;
  }
  if (error || !catalog) {
    return <p className="py-16 text-center text-sm text-danger">Could not load tags.</p>;
  }

  const tags = deriveSpecificTags(catalog).map((tag) => {
    const learned = tag.problemIds.filter((id) =>
      LEARNED.includes(catalog.statuses[id] ?? ""),
    ).length;
    return {
      id: tag.id,
      name: tag.name,
      description: tag.description,
      total: tag.problemIds.length,
      learned,
    };
  });

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Tags"
        subtitle="Focused groups — pick one narrow idea and practise just those problems."
      />
      <TagBrowser tags={tags} />
    </>
  );
}
