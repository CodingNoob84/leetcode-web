import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getList, getProblemDetail } from "@/lib/db/queries";
import { ago, dueAt, isLearned, level, nowMs, relativeDue, scheduleText } from "@/lib/learn";
import { studyOrder } from "@/lib/stats";
import { parseRandomFrom, randomHref, sampleProblems } from "@/lib/random";
import { Badge, DifficultyPill, PageHeader, SectionTitle } from "@/components/ui";
import { CodeBlock } from "@/components/CodeBlock";
import { Examples } from "@/components/Examples";
import { RichText } from "@/components/RichText";
import { NotesEditor } from "@/components/NotesEditor";
import { ProblemPager } from "@/components/ProblemPager";
import { RatePanel } from "@/components/RatePanel";
import { SolutionWorkspace } from "@/components/SolutionWorkspace";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const [detail, catalog] = await Promise.all([getProblemDetail(id), getCatalog()]);
  if (!detail) notFound();

  const p = detail.problem;
  const detailTags = catalog.problemTags
    .filter((l) => l.problemId === p.id)
    .flatMap((l) => catalog.tags.filter((t) => t.id === l.tagId));
  const status = catalog.statuses[p.id];
  const confidence = catalog.confidence[p.id];
  const reviewedAt = catalog.reviewedAt[p.id];
  const learned = isLearned(status);
  const lvl = level(confidence);
  const nextDue = dueAt(confidence, reviewedAt);

  // Prev/Next follows where the reader came from: a curated list, a specific
  // subpattern section, a topic, or the problem's own pattern by default.
  const ordered = studyOrder(
    catalog.problems,
    catalog.topics,
    catalog.subpatterns,
    catalog.problemSubpatterns,
  );
  const idsInSubpattern = (subpatternId: string) =>
    ordered
      .filter((x) =>
        catalog.problemSubpatterns.some(
          (l) => l.problemId === x.id && l.subpatternId === subpatternId,
        ),
      )
      .map((x) => x.id);

  let sequenceIds = ordered.map((x) => x.id);
  const originList = from?.startsWith("list:")
    ? await getList(from.slice("list:".length))
    : null;
  const originRandom = from?.startsWith("random:") ? parseRandomFrom(from) : null;
  if (originList) {
    sequenceIds = originList.problems.map((x) => x.id);
  } else if (originRandom) {
    sequenceIds = sampleProblems(catalog.problems, catalog.confidence, originRandom).map(
      (x) => x.id,
    );
  } else if (from?.startsWith("sp:")) {
    const ids = idsInSubpattern(from.slice("sp:".length));
    if (ids.length) sequenceIds = ids;
  } else if (from?.startsWith("topic:")) {
    const topicId = from.slice("topic:".length);
    const ids = ordered
      .filter((x) =>
        catalog.problemTopics.some((l) => l.problemId === x.id && l.topicId === topicId),
      )
      .map((x) => x.id);
    if (ids.length) sequenceIds = ids;
  } else if (from?.startsWith("tag:")) {
    const tagId = from.slice("tag:".length);
    const ids = ordered
      .filter((x) =>
        catalog.problemTags.some((l) => l.problemId === x.id && l.tagId === tagId),
      )
      .map((x) => x.id);
    if (ids.length) sequenceIds = ids;
  } else if (detail.subpatterns.length) {
    const ids = idsInSubpattern(detail.subpatterns[0]!.id);
    if (ids.length) sequenceIds = ids;
  }
  if (!sequenceIds.includes(p.id)) sequenceIds = ordered.map((x) => x.id);

  // "Back" returns to the list the reader came from — never to the prev problem.
  let back = { href: "/problems", label: "All problems" };
  if (from?.startsWith("sp:")) {
    const sp = catalog.subpatterns.find((x) => x.id === from.slice("sp:".length));
    const topic = sp && catalog.topics.find((t) => t.id === sp.topicId);
    if (sp && topic) back = { href: `/topics/${topic.id}#sp-${sp.id}`, label: topic.name };
  } else if (from?.startsWith("topic:")) {
    const topic = catalog.topics.find((x) => x.id === from.slice("topic:".length));
    if (topic) back = { href: `/topics/${topic.id}`, label: topic.name };
  } else if (from?.startsWith("tag:")) {
    const tag = catalog.tags.find((x) => x.id === from.slice("tag:".length));
    if (tag) back = { href: `/tags/${tag.id}`, label: tag.name };
  } else if (originList) {
    back = { href: `/lists/${originList.list.id}`, label: originList.list.name };
  } else if (originRandom) {
    back = { href: randomHref(originRandom), label: "Random set" };
  }

  const titleOf = (pid: string) => catalog.problems.find((x) => x.id === pid)?.title ?? "";
  const sequence = sequenceIds.map((pid) => ({ id: pid, title: titleOf(pid) }));

  return (
    <>
      <Link
        href={back.href}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink-dim"
      >
        ← Back to {back.label}
      </Link>

      <PageHeader
        title={p.title}
        subtitle={detail.subpatterns.map((s) => s.name).join(" · ") || undefined}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyPill d={p.difficulty} />
            {lvl ? (
              <Badge text={`${lvl.value} · ${lvl.label}`} color={lvl.color} />
            ) : learned ? (
              <Badge text="Learned" color="var(--color-primary)" />
            ) : (
              <Badge text="Not learned yet" color="var(--color-muted)" />
            )}
            {nextDue !== null ? (
              <span
                className={`text-xs ${
                  nextDue <= nowMs() ? "text-warning" : "text-muted"
                }`}
              >
                {relativeDue(nextDue)}
              </span>
            ) : null}
            {p.leetcodeUrl ? (
              <a
                href={p.leetcodeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                LeetCode ↗
              </a>
            ) : null}
          </div>
        }
      />

      {detailTags.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Tags</span>
          {detailTags.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.id}`}
              className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-muted hover:text-ink-dim"
            >
              {t.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <SectionTitle className="mt-0">Problem</SectionTitle>
          <div className="rounded-card border border-line-subtle bg-card p-5">
            <RichText text={p.description} />
          </div>

          {p.examples && p.examples.length > 0 ? (
            <Examples examples={p.examples} />
          ) : null}

          {p.constraints ? (
            <div className="mt-3 rounded-card border border-line-subtle bg-card p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Constraints
              </p>
              <ul className="space-y-1">
                {p.constraints
                  .split("\n")
                  .map((line) => line.replace(/^[-*]\s*/, "").trim())
                  .filter(Boolean)
                  .map((line, index) => (
                    <li
                      key={index}
                      className="flex gap-2 font-mono text-[12.5px] leading-5 text-ink-dim"
                    >
                      <span className="text-placeholder">-</span>
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          {/* Test cases stay out of the UI: the expected outputs would spoil
              the exercise. They are still fetched with the pattern bundle. */}

          <SectionTitle>Solutions ({detail.solutions.length})</SectionTitle>
          <SolutionWorkspace
            problemId={p.id}
            solutions={detail.solutions}
            template={p.solutionTemplate}
            confidence={confidence}
          />

          {/* On phones the rating block and prev/next sit right above the
              notes so they are reachable without scrolling past the aside. */}
          <div className="mt-6 lg:hidden">
            <SectionTitle className="mt-0">How well do you know it?</SectionTitle>
            <RatePanel
              problemId={p.id}
              confidence={confidence}
              reviewedAt={reviewedAt}
              learned={learned}
            />
            <p className="mt-2 text-[11.5px] leading-4 text-placeholder">
              {scheduleText(confidence)}
              {reviewedAt ? ` · rated ${ago(reviewedAt)}` : ""}
            </p>
            <ProblemPager
              items={sequence}
              currentId={p.id}
              from={from}
              className="mt-4"
            />
          </div>

          <SectionTitle>My notes</SectionTitle>
          <NotesEditor problemId={p.id} initial={detail.note} />
        </div>

        <aside className="min-w-0 space-y-6">
          <div className="hidden lg:block">
            <SectionTitle className="mt-0">How well do you know it?</SectionTitle>
            <RatePanel
              problemId={p.id}
              confidence={confidence}
              reviewedAt={reviewedAt}
              learned={learned}
            />
            <p className="mt-2 text-[11.5px] leading-4 text-placeholder">
              {scheduleText(confidence)}
              {reviewedAt ? ` · rated ${ago(reviewedAt)}` : ""}
            </p>
          </div>

          {detail.topics.length > 0 ? (
            <div>
              <SectionTitle className="mt-0">Topics</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {detail.topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.id}`}
                    className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-muted hover:text-ink-dim"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {detail.subpatterns.length > 0 ? (
            <div>
              <SectionTitle className="mt-0">Pattern</SectionTitle>
              {detail.subpatterns.map((sp) => (
                <div
                  key={sp.id}
                  className="mb-3 rounded-card border border-line-subtle bg-card p-4"
                >
                  <p className="text-sm font-semibold text-ink">{sp.name}</p>
                  {sp.identification ? (
                    <>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        How to spot it
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-ink-dim">
                        {sp.identification}
                      </p>
                    </>
                  ) : null}
                  {sp.strategy ? (
                    <>
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        Strategy
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[13px] leading-5 text-ink-dim">
                        {sp.strategy}
                      </p>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {p.solutionTemplate && detail.solutions.length === 0 ? (
            <div>
              <SectionTitle className="mt-0">Starter template</SectionTitle>
              <CodeBlock code={p.solutionTemplate} />
            </div>
          ) : null}
        </aside>
      </div>

      <ProblemPager
        items={sequence}
        currentId={p.id}
        from={from}
        className="mt-8 hidden lg:flex"
      />
    </>
  );
}
