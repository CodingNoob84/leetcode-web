export interface DerivedTag {
  id: string;
  name: string;
  description: string | null;
  problemIds: string[];
}

interface DeriveInput {
  tags: { id: string; name: string; description: string | null }[];
  problemTags: { problemId: string; tagId: string }[];
}

const BROAD_TAG_MIN = 16;

export function deriveSpecificTags(src: DeriveInput): DerivedTag[] {
  const problemsByTag = new Map<string, Set<string>>();
  for (const link of src.problemTags) {
    const ids = problemsByTag.get(link.tagId) ?? new Set<string>();
    ids.add(link.problemId);
    problemsByTag.set(link.tagId, ids);
  }

  return src.tags
    .flatMap((tag) => {
      const ids = problemsByTag.get(tag.id);
      if (!ids || ids.size === 0 || ids.size >= BROAD_TAG_MIN) return [];
      return [
        {
          id: tag.id,
          name: tag.name,
          description: tag.description,
          problemIds: [...ids],
        },
      ];
    })
    .sort((a, b) => b.problemIds.length - a.problemIds.length || a.name.localeCompare(b.name));
}
