import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// PostgreSQL (Neon) schema — mirrors leetcode-app/lib/db/schema.pg.ts so both
// apps read and write exactly the same rows.
// - PKs are TEXT: stable seeded ids for catalog rows, generated ids for user rows.
// - Timestamps are BIGINT ms-epoch: identical sync-cursor semantics as SQLite.
// - JSONB for structured fields.
// ---------------------------------------------------------------------------

const msNow = () =>
  bigint("created_at", { mode: "number" }).notNull().$defaultFn(() => Date.now());
const msUpdated = () =>
  bigint("updated_at", { mode: "number" })
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdate(() => Date.now());

// Server-assigned sync revision: every insert takes nextval('sync_rev') and a
// BEFORE UPDATE trigger bumps it on every update. The mobile app pulls by rev,
// so writes made here reach the phone on its next sync.
const syncRev = () =>
  bigint("rev", { mode: "number" }).notNull().default(sql`nextval('sync_rev')`);

export interface ProblemExample {
  input: unknown;
  output: unknown;
  explanation?: string;
}

export const problems = pgTable("problems", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull().$type<"EASY" | "MEDIUM" | "HARD">(),
  description: text("description").notNull().default(""),
  constraints: text("constraints"),
  examples: jsonb("examples").$type<ProblemExample[]>(),
  leetcodeUrl: text("leetcode_url"),
  gfgUrl: text("gfg_url"),
  solutionTemplate: text("solution_template"),
  createdAt: msNow(),
  updatedAt: msUpdated(),
  rev: syncRev(),
});

export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const subpatterns = pgTable("subpatterns", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  strategy: text("strategy"),
  identification: text("identification"),
  position: integer("position").notNull().default(0),
  createdAt: msNow(),
});

export const problemTopics = pgTable(
  "problem_topics",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.problemId, t.topicId] })],
);

export const problemSubpatterns = pgTable(
  "problem_subpatterns",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    subpatternId: text("subpattern_id")
      .notNull()
      .references(() => subpatterns.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.problemId, t.subpatternId] })],
);

export const tags = pgTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const problemTags = pgTable(
  "problem_tags",
  {
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.problemId, t.tagId] })],
);

export const curatedLists = pgTable("curated_lists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  source: text("source"),
  createdAt: msNow(),
  rev: syncRev(),
});

export const curatedListProblems = pgTable(
  "curated_list_problems",
  {
    listId: text("list_id")
      .notNull()
      .references(() => curatedLists.id, { onDelete: "cascade" }),
    problemId: text("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.listId, t.problemId] })],
);

export const solutions = pgTable("solutions", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  language: text("language").notNull().default("PYTHON"),
  code: text("code").notNull().default(""),
  explanation: text("explanation"),
  timeComplexity: text("time_complexity"),
  spaceComplexity: text("space_complexity"),
  isPreferred: boolean("is_preferred").notNull().default(false),
  createdAt: msNow(),
  updatedAt: msUpdated(),
  rev: syncRev(),
});

export const testCases = pgTable("test_cases", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  inputData: jsonb("input_data").notNull(),
  expectedOutput: jsonb("expected_output"),
  isSample: boolean("is_sample").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: msNow(),
  rev: syncRev(),
});

export const problemProgress = pgTable("problem_progress", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .unique()
    .references(() => problems.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("NOT_STARTED"),
  attemptCount: integer("attempt_count").notNull().default(0),
  solvedAt: bigint("solved_at", { mode: "number" }),
  lastAttemptedAt: bigint("last_attempted_at", { mode: "number" }),
  confidence: integer("confidence"),
  favorite: boolean("favorite").notNull().default(false),
  needsReview: boolean("needs_review").notNull().default(false),
  createdAt: msNow(),
  updatedAt: msUpdated(),
  rev: syncRev(),
});

export const notes = pgTable("notes", {
  problemId: text("problem_id")
    .primaryKey()
    .references(() => problems.id, { onDelete: "cascade" }),
  content: text("content").notNull().default(""),
  updatedAt: msUpdated(),
  rev: syncRev(),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  solutionId: text("solution_id").references(() => solutions.id, {
    onDelete: "set null",
  }),
  language: text("language").notNull().default("PYTHON"),
  status: text("status").notNull(),
  testsPassed: integer("tests_passed").notNull().default(0),
  testsTotal: integer("tests_total").notNull().default(0),
  executionTimeMs: integer("execution_time_ms"),
  memoryUsageKb: integer("memory_usage_kb"),
  errorMessage: text("error_message"),
  createdAt: msNow(),
  rev: syncRev(),
});
