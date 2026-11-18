import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { cached, DEFAULT_TTL_MS, invalidateCache } from "./cache";
import * as s from "./schema";

// ---------------------------------------------------------------------------
// Reads are batched into a single SQL round-trip and cached on disk.
//
// A Neon round-trip from a home connection takes 1-3 s, while the content
// itself changes rarely. So:
//   - the catalog (problems, topics, patterns, lists, progress) is one query
//     and is cached under "catalog";
//   - the content of a pattern (its problems with solutions, notes and test
//     cases) is one bulk query and is cached per sub-pattern under
//     "sub_<id>", so opening a problem inside a pattern costs one request the
//     first time and none afterwards.
// ---------------------------------------------------------------------------

type Json = unknown;

function firstRow(res: unknown): Record<string, Json> {
  const value = res as { rows?: Record<string, Json>[] } | Record<string, Json>[];
  if (Array.isArray(value)) return (value[0] as Record<string, Json>) ?? {};
  if (value && Array.isArray(value.rows)) return value.rows[0] ?? {};
  return {};
}

function parseJson<T>(value: Json, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export interface CatalogProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
}

export interface CatalogTopic {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogSubpattern {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  strategy: string | null;
  identification: string | null;
  position: number;
}

export interface CatalogList {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CatalogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Catalog {
  problems: CatalogProblem[];
  topics: CatalogTopic[];
  subpatterns: CatalogSubpattern[];
  problemTopics: { problemId: string; topicId: string }[];
  problemSubpatterns: { problemId: string; subpatternId: string }[];
  tags: CatalogTag[];
  problemTags: { problemId: string; tagId: string }[];
  lists: CatalogList[];
  listEntries: { listId: string; problemId: string; position: number }[];
  statuses: Record<string, string>;
  confidence: Record<string, number>;
  reviewedAt: Record<string, number>;
}

const CATALOG_SQL = sql`
  select
    (select coalesce(json_agg(json_build_object(
        'id', t.id, 'name', t.name, 'slug', t.slug) order by t.name), '[]'::json)
      from topics t) as topics,
    (select coalesce(json_agg(json_build_object(
        'id', sp.id, 'topic_id', sp.topic_id, 'name', sp.name, 'slug', sp.slug,
        'strategy', sp.strategy, 'identification', sp.identification,
        'position', sp.position) order by sp.topic_id, sp.position), '[]'::json)
      from subpatterns sp) as subpatterns,
    (select coalesce(json_agg(json_build_object(
        'id', p.id, 'slug', p.slug, 'title', p.title, 'difficulty', p.difficulty)
        order by p.title), '[]'::json)
      from problems p) as problems,
    (select coalesce(json_agg(json_build_object(
        'problem_id', pt.problem_id, 'topic_id', pt.topic_id)), '[]'::json)
      from problem_topics pt) as problem_topics,
    (select coalesce(json_agg(json_build_object(
        'problem_id', ps.problem_id, 'subpattern_id', ps.subpattern_id)), '[]'::json)
      from problem_subpatterns ps) as problem_subpatterns,
    (select coalesce(json_agg(json_build_object(
        'id', tg.id, 'name', tg.name, 'slug', tg.slug, 'description', tg.description)
        order by tg.name), '[]'::json)
      from tags tg) as tags,
    (select coalesce(json_agg(json_build_object(
        'problem_id', ptg.problem_id, 'tag_id', ptg.tag_id)), '[]'::json)
      from problem_tags ptg) as problem_tags,
    (select coalesce(json_agg(json_build_object(
        'id', cl.id, 'name', cl.name, 'slug', cl.slug, 'description', cl.description)
        order by cl.name), '[]'::json)
      from curated_lists cl) as curated_lists,
    (select coalesce(json_agg(json_build_object(
        'list_id', clp.list_id, 'problem_id', clp.problem_id,
        'position', clp.position) order by clp.list_id, clp.position), '[]'::json)
      from curated_list_problems clp) as curated_list_problems,
    (select coalesce(json_agg(json_build_object(
        'problem_id', pp.problem_id, 'status', pp.status,
        'confidence', pp.confidence, 'last_attempted_at', pp.last_attempted_at,
        'updated_at', pp.updated_at)), '[]'::json)
      from problem_progress pp) as problem_progress
`;

/** The whole catalog in a single round-trip. */
const fetchCatalog = async (): Promise<Catalog> => {
  const row = firstRow(await db.execute(CATALOG_SQL));

  const problems = parseJson<CatalogProblem[]>(row.problems, []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
  }));

  const subpatterns = parseJson<
    {
      id: string;
      topic_id: string;
      name: string;
      slug: string;
      strategy: string | null;
      identification: string | null;
      position: number;
    }[]
  >(row.subpatterns, []).map((sp) => ({
    id: sp.id,
    topicId: sp.topic_id,
    name: sp.name,
    slug: sp.slug,
    strategy: sp.strategy,
    identification: sp.identification,
    position: sp.position,
  }));

  const progress = parseJson<
    {
      problem_id: string;
      status: string;
      confidence: number | null;
      last_attempted_at: number | null;
      updated_at: number;
    }[]
  >(row.problem_progress, []);

  const statuses: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  const reviewedAt: Record<string, number> = {};
  for (const p of progress) {
    statuses[p.problem_id] = p.status;
    if (p.confidence != null) confidence[p.problem_id] = p.confidence;
    reviewedAt[p.problem_id] = p.last_attempted_at ?? p.updated_at;
  }

  return {
    problems,
    topics: parseJson<CatalogTopic[]>(row.topics, []),
    subpatterns,
    problemTopics: parseJson<{ problemId: string; topicId: string }[]>(
      parseJson<{ problem_id: string; topic_id: string }[]>(row.problem_topics, []).map((l) => ({
        problemId: l.problem_id,
        topicId: l.topic_id,
      })),
      [],
    ),
    problemSubpatterns: parseJson<{ problemId: string; subpatternId: string }[]>(
      parseJson<{ problem_id: string; subpattern_id: string }[]>(row.problem_subpatterns, []).map(
        (l) => ({ problemId: l.problem_id, subpatternId: l.subpattern_id }),
      ),
      [],
    ),
    tags: parseJson<CatalogTag[]>(row.tags, []),
    problemTags: parseJson<{ problemId: string; tagId: string }[]>(
      parseJson<{ problem_id: string; tag_id: string }[]>(row.problem_tags, []).map((l) => ({
        problemId: l.problem_id,
        tagId: l.tag_id,
      })),
      [],
    ),
    lists: parseJson<CatalogList[]>(row.curated_lists, []),
    listEntries: parseJson<{ listId: string; problemId: string; position: number }[]>(
      parseJson<{ list_id: string; problem_id: string; position: number }[]>(
        row.curated_list_problems,
        [],
      ).map((e) => ({
        listId: e.list_id,
        problemId: e.problem_id,
        position: e.position,
      })),
      [],
    ),
    statuses,
    confidence,
    reviewedAt,
  };
};

export const getCatalog = cache(async (): Promise<Catalog> => {
  return cached("catalog", fetchCatalog);
});

export interface SolutionRow {
  id: string;
  problemId: string;
  name: string;
  code: string;
  language: string;
  explanation: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  isPreferred: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProblemDetail {
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    description: string;
    constraints: string | null;
    examples: { input: unknown; output: unknown; explanation?: string }[] | null;
    leetcodeUrl: string | null;
    gfgUrl: string | null;
    solutionTemplate: string | null;
  };
  topics: CatalogTopic[];
  subpatterns: CatalogSubpattern[];
  solutions: SolutionRow[];
  note: string;
  testCases: {
    id: string;
    name: string;
    inputData: unknown;
    expectedOutput: unknown;
    isSample: boolean;
    isHidden: boolean;
  }[];
}

interface RawSolution {
  id: string;
  name: string;
  code: string;
  language: string;
  explanation: string | null;
  time_complexity: string | null;
  space_complexity: string | null;
  is_preferred: boolean;
  created_at: number;
  updated_at: number;
}

interface RawTestCase {
  id: string;
  name: string;
  input_data: unknown;
  expected_output: unknown;
  is_sample: boolean;
  is_hidden: boolean;
}

interface RawProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  description: string;
  constraints: string | null;
  examples: { input: unknown; output: unknown; explanation?: string }[] | null;
  leetcode_url: string | null;
  gfg_url: string | null;
  solution_template: string | null;
  solutions: RawSolution[];
  note: string | null;
  test_cases: RawTestCase[];
}

const PROBLEM_COLUMNS = `
  'id', p.id, 'slug', p.slug, 'title', p.title, 'difficulty', p.difficulty,
  'description', p.description, 'constraints', p.constraints, 'examples', p.examples,
  'leetcode_url', p.leetcode_url, 'gfg_url', p.gfg_url, 'solution_template', p.solution_template,
  'solutions', (select coalesce(json_agg(json_build_object(
      'id', so.id, 'name', so.name, 'code', so.code, 'language', so.language,
      'explanation', so.explanation, 'time_complexity', so.time_complexity,
      'space_complexity', so.space_complexity, 'is_preferred', so.is_preferred,
      'created_at', so.created_at, 'updated_at', so.updated_at)
      order by so.is_preferred desc, so.created_at), '[]'::json)
    from solutions so where so.problem_id = p.id),
  'note', (select n.content from notes n where n.problem_id = p.id),
  'test_cases', (select coalesce(json_agg(json_build_object(
      'id', tc.id, 'name', tc.name, 'input_data', tc.input_data,
      'expected_output', tc.expected_output, 'is_sample', tc.is_sample,
      'is_hidden', tc.is_hidden) order by tc.is_sample desc, tc.name), '[]'::json)
    from test_cases tc where tc.problem_id = p.id)`;

/** Every problem of one sub-pattern with its solutions, notes and tests. */
export interface SubpatternBundle {
  subpatternId: string;
  problems: RawProblem[];
}

const fetchSubpatternBundle = async (subpatternId: string): Promise<SubpatternBundle> => {
  const row = firstRow(
    await db.execute(sql`
      select coalesce(json_agg(json_build_object(${sql.raw(PROBLEM_COLUMNS)})), '[]'::json)
        as problems
      from problems p
      where p.id in (
        select problem_id from problem_subpatterns where subpattern_id = ${subpatternId}
      )
    `),
  );
  return { subpatternId, problems: parseJson<RawProblem[]>(row.problems, []) };
};

export const getSubpatternBundle = cache(
  async (subpatternId: string): Promise<SubpatternBundle> => {
    return cached(`sub_${subpatternId}`, () => fetchSubpatternBundle(subpatternId));
  },
);

/** A single problem, used for problems that are not linked to any pattern. */
const fetchProblem = async (id: string): Promise<RawProblem | null> => {
  const row = firstRow(
    await db.execute(sql`
      select json_build_object(${sql.raw(PROBLEM_COLUMNS)}) as problem
      from problems p where p.id = ${id}
    `),
  );
  return (row.problem as RawProblem | null) ?? null;
};

function toDetail(raw: RawProblem, catalog: Catalog): ProblemDetail {
  const topics = catalog.problemTopics
    .filter((l) => l.problemId === raw.id)
    .flatMap((l) => catalog.topics.filter((t) => t.id === l.topicId));

  const subpatterns = catalog.problemSubpatterns
    .filter((l) => l.problemId === raw.id)
    .flatMap((l) => catalog.subpatterns.filter((sp) => sp.id === l.subpatternId));

  return {
    problem: {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      difficulty: raw.difficulty,
      description: raw.description,
      constraints: raw.constraints,
      examples: raw.examples ?? null,
      leetcodeUrl: raw.leetcode_url,
      gfgUrl: raw.gfg_url,
      solutionTemplate: raw.solution_template,
    },
    topics,
    subpatterns,
    solutions: raw.solutions.map((x) => ({
      id: x.id,
      problemId: raw.id,
      name: x.name,
      code: x.code,
      language: x.language,
      explanation: x.explanation,
      timeComplexity: x.time_complexity,
      spaceComplexity: x.space_complexity,
      isPreferred: x.is_preferred,
      createdAt: x.created_at,
      updatedAt: x.updated_at,
    })),
    note: raw.note ?? "",
    testCases: raw.test_cases.map((c) => ({
      id: c.id,
      name: c.name,
      inputData: c.input_data,
      expectedOutput: c.expected_output,
      isSample: c.is_sample,
      isHidden: c.is_hidden,
    })),
  };
}

export const getProblemDetail = cache(
  async (id: string): Promise<ProblemDetail | null> => {
    const catalog = await getCatalog();
    const subpatternId = catalog.problemSubpatterns.find((l) => l.problemId === id)?.subpatternId;

    if (subpatternId) {
      const bundle = await getSubpatternBundle(subpatternId);
      const raw = bundle.problems.find((p) => p.id === id);
      if (raw) return toDetail(raw, catalog);
    }

    const raw = await cached(`problem_${id}`, () => fetchProblem(id));
    return raw ? toDetail(raw, catalog) : null;
  },
);

export async function getProgress(problemId: string) {
  const [row] = await db
    .select()
    .from(s.problemProgress)
    .where(eq(s.problemProgress.problemId, problemId))
    .limit(1);
  if (!row) return null;
  return {
    problemId: row.problemId,
    status: row.status,
    confidence: row.confidence,
    lastAttemptedAt: row.lastAttemptedAt,
    updatedAt: row.updatedAt,
  };
}

const fetchList = async (id: string) => {
  const row = firstRow(
    await db.execute(sql`
      select
        (select json_build_object('id', cl.id, 'name', cl.name, 'slug', cl.slug,
            'description', cl.description, 'source', cl.source)
          from curated_lists cl where cl.id = ${id}) as list,
        (select coalesce(json_agg(json_build_object(
            'id', p.id, 'slug', p.slug, 'title', p.title,
            'difficulty', p.difficulty) order by clp.position), '[]'::json)
          from curated_list_problems clp join problems p on p.id = clp.problem_id
          where clp.list_id = ${id}) as problems
    `),
  );

  const list = row.list as
    | { id: string; name: string; slug: string; description: string | null; source: string | null }
    | null;
  if (!list) return null;

  const problems = parseJson<
    { id: string; slug: string; title: string; difficulty: string }[]
  >(row.problems, []);

  return { list, problems };
};

export const getList = cache(async (id: string) => {
  return cached(`list_${id}`, () => fetchList(id), DEFAULT_TTL_MS);
});

// ---------------------------------------------------------------------------
// Cache invalidation.
//
// Progress (rating) only affects the catalog; solution/note edits only affect
// the content bundles. A manual refresh drops everything.
// ---------------------------------------------------------------------------

export async function invalidateProgress() {
  await invalidateCache("catalog");
}

export async function invalidateContent() {
  await invalidateCache("sub_");
  await invalidateCache("problem_");
  await invalidateCache("list_");
}

export async function invalidateAll() {
  await invalidateCache();
}
