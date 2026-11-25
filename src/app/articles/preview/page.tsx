import { BackLink } from "@/components/ui";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { getFileArticles, readFileArticle } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage() {
  const [firstArticle] = await getFileArticles();
  const article = firstArticle ? await readFileArticle(firstArticle.id) : null;

  if (!article) {
    return (
      <div className="rounded-card border border-dashed border-line bg-card/60 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-ink-dim">No article files found</p>
        <p className="mt-1 text-xs text-muted">
          Add a Markdown file under the articles folder to preview it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <BackLink href="/articles">All articles</BackLink>
      <p className="mb-4 text-[11px] text-muted">
        Previewing source file: articles/{article.file}
      </p>
      <article className="rounded-panel border border-line-subtle bg-card p-5 sm:p-8">
        <MarkdownArticle content={article.content} />
      </article>
    </>
  );
}
