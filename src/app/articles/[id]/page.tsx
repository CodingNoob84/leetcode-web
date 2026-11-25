import { notFound } from "next/navigation";
import Link from "next/link";
import { BackLink, PageHeader } from "@/components/ui";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { getFileArticleWithNavigation } from "@/lib/articles";
import { ArticleReadingControls } from "@/components/ArticleReadingControls";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getFileArticleWithNavigation(id);
  if (!result) notFound();
  const { article, navigation } = result;

  return (
    <>
      <BackLink href="/articles">All articles</BackLink>
      <PageHeader title={article.title} subtitle={article.summary || article.category} />
      <article className="rounded-panel border border-line-subtle bg-card p-5 sm:p-8">
        <MarkdownArticle content={article.content} />
      </article>
      <nav
        aria-label={`More articles in ${article.category}`}
        data-article-navigation
        className="mt-6 grid gap-3 sm:grid-cols-2"
      >
        {navigation.previous ? (
          <Link
            href={`/articles/${navigation.previous.id}`}
            className="rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
              ← Previous
            </span>
            <span className="mt-1 block text-sm font-semibold text-ink">
              {navigation.previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {navigation.next ? (
          <Link
            href={`/articles/${navigation.next.id}`}
            className="rounded-card border border-line-subtle bg-card p-4 text-right transition-colors hover:bg-elevated/50"
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">
              Next →
            </span>
            <span className="mt-1 block text-sm font-semibold text-ink">
              {navigation.next.title}
            </span>
          </Link>
        ) : null}
      </nav>
      <ArticleReadingControls />
    </>
  );
}
