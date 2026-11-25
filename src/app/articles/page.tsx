import Link from "next/link";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { getFileArticles } from "@/lib/articles";

export default async function ArticlesPage() {
  const articles = await getFileArticles();
  const groupedArticles = Map.groupBy(articles, (article) => article.category);

  return (
    <>
      <BackLink href="/">Dashboard</BackLink>
      <PageHeader
        title="Articles"
        subtitle="Study notes loaded directly from the articles folder."
      />

      <div className="space-y-8">
        {[...groupedArticles].map(([category, categoryArticles]) => (
          <section key={category}>
            <div className="mb-3 flex items-center justify-between border-b border-line-subtle pb-2">
              <h2 className="text-sm font-bold text-ink">{category}</h2>
              <span className="text-[11px] text-muted">
                {categoryArticles.length} {categoryArticles.length === 1 ? "article" : "articles"}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categoryArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="group flex flex-col rounded-card border border-line-subtle bg-card p-4 transition-colors hover:bg-elevated/50"
                >
                  <p className="text-[15px] font-semibold text-ink group-hover:text-primary">
                    {article.title}
                  </p>
                  {article.summary ? (
                    <p className="mt-1 flex-1 text-xs leading-5 text-muted">
                      {article.summary}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          body="Add Markdown files under the articles folder to make them available here."
        />
      ) : null}
    </>
  );
}
