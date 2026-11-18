"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { invalidateAll, invalidateContent, invalidateProgress } from "@/lib/db/queries";
import * as s from "@/lib/db/schema";

// Writes go straight to Neon, the same database the mobile app syncs from.
// `updated_at` is the ms-epoch last-write-wins stamp the mobile client
// compares against, so always stamp it with the current time.

const problemIdSchema = z.string().min(1).max(200);

const rateSchema = z.object({
  problemId: problemIdSchema,
  confidence: z.number().int().min(1).max(5),
});

const solutionSchema = z.object({
  problemId: problemIdSchema,
  solutionId: z.string().min(1).max(200).nullable(),
  name: z.string().trim().min(1).max(120),
  code: z.string().max(200_000),
  explanation: z.string().max(50_000).nullable(),
  timeComplexity: z.string().max(120).nullable(),
  spaceComplexity: z.string().max(120).nullable(),
  isPreferred: z.boolean().optional(),
});

const noteSchema = z.object({
  problemId: problemIdSchema,
  content: z.string().max(200_000),
});

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Drop the cached rows of the problem's pattern and re-render the pages. */
async function revalidateProblemContent(problemId: string) {
  // The cache must be dropped *before* the re-render, otherwise the page is
  // re-rendered from the stale copy and the change appears to be lost.
  await invalidateContent();
  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${problemId}`);
  revalidatePath("/revisit");
  revalidatePath("/mastered");
}

/** Drop the cached progress rows and re-render the pages that show them. */
async function revalidateProgressOnly(problemId: string) {
  await invalidateProgress();
  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${problemId}`);
  revalidatePath("/revisit");
  revalidatePath("/mastered");
}

/** Rate a problem 1–5: marks it learned and reschedules its revisit. */
export async function rateProblem(input: z.infer<typeof rateSchema>) {
  const { problemId, confidence } = rateSchema.parse(input);
  const now = Date.now();
  const status = confidence === 5 ? "MASTERED" : "SOLVED";

  const [existing] = await db
    .select()
    .from(s.problemProgress)
    .where(eq(s.problemProgress.problemId, problemId))
    .limit(1);

  if (!existing) {
    await db.insert(s.problemProgress).values({
      id: `prog_${problemId}`,
      problemId,
      status,
      attemptCount: 1,
      solvedAt: now,
      lastAttemptedAt: now,
      confidence,
      favorite: false,
      needsReview: false,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await db
      .update(s.problemProgress)
      .set({
        status,
        confidence,
        solvedAt: existing.solvedAt ?? now,
        lastAttemptedAt: now,
        attemptCount: existing.attemptCount + 1,
        needsReview: false,
        updatedAt: now,
      })
      .where(eq(s.problemProgress.problemId, problemId));
  }

  await revalidateProgressOnly(problemId);
  return { ok: true as const };
}

/** Create or update one of a problem's solutions. */
export async function saveSolution(input: z.infer<typeof solutionSchema>) {
  const data = solutionSchema.parse(input);
  const now = Date.now();
  let savedId: string;

  if (data.solutionId) {
    savedId = data.solutionId;
    const [existing] = await db
      .select()
      .from(s.solutions)
      .where(
        and(eq(s.solutions.id, data.solutionId), eq(s.solutions.problemId, data.problemId)),
      )
      .limit(1);
    if (!existing) throw new Error("Solution not found for this problem");

    await db
      .update(s.solutions)
      .set({
        name: data.name,
        code: data.code,
        explanation: data.explanation,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
        ...(data.isPreferred === undefined ? {} : { isPreferred: data.isPreferred }),
        updatedAt: now,
      })
      .where(eq(s.solutions.id, data.solutionId));

    if (data.isPreferred) {
      await db
        .update(s.solutions)
        .set({ isPreferred: false })
        .where(
          and(eq(s.solutions.problemId, data.problemId), eq(s.solutions.isPreferred, true)),
        );
    }
  } else {
    const siblings = await db
      .select()
      .from(s.solutions)
      .where(eq(s.solutions.problemId, data.problemId));
    savedId = newId("sol");
    await db.insert(s.solutions).values({
      id: savedId,
      problemId: data.problemId,
      name: data.name,
      language: "PYTHON",
      code: data.code,
      explanation: data.explanation,
      timeComplexity: data.timeComplexity,
      spaceComplexity: data.spaceComplexity,
      isPreferred: data.isPreferred ?? siblings.length === 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  await revalidateProblemContent(data.problemId);
  return { ok: true as const, solutionId: savedId };
}

/** Mark a solution as the preferred one for its problem. */
export async function setPreferredSolution(problemId: string, solutionId: string) {
  const id = problemIdSchema.parse(problemId);
  const now = Date.now();
  await db
    .update(s.solutions)
    .set({ isPreferred: false })
    .where(and(eq(s.solutions.problemId, id), eq(s.solutions.isPreferred, true)));
  await db
    .update(s.solutions)
    .set({ isPreferred: true, updatedAt: now })
    .where(and(eq(s.solutions.id, solutionId), eq(s.solutions.problemId, id)));
  await revalidateProblemContent(id);
  return { ok: true as const };
}

export async function deleteSolution(problemId: string, solutionId: string) {
  const id = problemIdSchema.parse(problemId);
  await db
    .delete(s.solutions)
    .where(and(eq(s.solutions.id, solutionId), eq(s.solutions.problemId, id)));
  await revalidateProblemContent(id);
  return { ok: true as const };
}

/** One note per problem; empty content removes it. */export async function saveNote(input: z.infer<typeof noteSchema>) {
  const { problemId, content } = noteSchema.parse(input);
  const now = Date.now();
  const trimmed = content.trim();

  if (!trimmed) {
    await db.delete(s.notes).where(eq(s.notes.problemId, problemId));
  } else {
    const [existing] = await db
      .select()
      .from(s.notes)
      .where(eq(s.notes.problemId, problemId))
      .limit(1);
    if (existing) {
      await db
        .update(s.notes)
        .set({ content: trimmed, updatedAt: now })
        .where(eq(s.notes.problemId, problemId));
    } else {
      await db
        .insert(s.notes)
        .values({ problemId, content: trimmed, updatedAt: now });
    }
  }

  await revalidateProblemContent(problemId);
  return { ok: true as const };
}

/** Drop the whole content cache and pull fresh rows from Neon. */
export async function refreshContentCache() {
  await invalidateAll();
  revalidatePath("/", "layout");
  return { ok: true as const };
}
