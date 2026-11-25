import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export function MarkdownArticle({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        h1: ({ id, children }) => (
          <h1 id={id} className="mb-4 mt-2 text-2xl font-bold tracking-tight text-ink">
            {children}
          </h1>
        ),
        h2: ({ id, children }) => (
          <h2
            id={id}
            className="mb-3 mt-10 scroll-mt-24 border-b border-line-subtle pb-2 text-xl font-bold tracking-tight text-ink"
          >
            {children}
          </h2>
        ),
        h3: ({ id, children }) => (
          <h3 id={id} className="mb-2 mt-6 text-base font-semibold text-ink">
            {children}
          </h3>
        ),
        h4: ({ id, children }) => (
          <h4 id={id} className="mb-2 mt-5 text-sm font-semibold text-ink-dim">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="my-3 text-sm leading-7 text-ink-dim">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-3 ml-5 list-disc space-y-1 text-sm leading-6 text-ink-dim marker:text-muted">
            {children}
          </ul>
        ),
        ol: ({ start, children }) => (
          <ol
            start={start}
            className="my-3 ml-5 list-decimal space-y-1 text-sm leading-6 text-ink-dim marker:text-muted"
          >
            {children}
          </ol>
        ),
        li: ({ className, children }) => (
          <li className={`pl-1 ${className ?? ""}`}>{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 rounded-r-card border-l-2 border-primary/60 bg-elevated/40 py-1 pl-4 pr-3 text-sm italic text-ink-dim [&>p]:my-2">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-8 border-line-subtle" />,
        a: ({ href, children }) => (
          <a href={href} className="font-medium text-secondary hover:underline">
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-ink">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ className, children }) => (
          <code
            className={
              className
                ? `font-mono ${className}`
                : "rounded bg-elevated px-1 py-0.5 font-mono text-[0.85em] text-ink-dim"
            }
          >
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="my-4 w-fit max-w-full overflow-x-auto whitespace-pre rounded-card border border-line-subtle bg-canvas px-4 py-3 text-[12px] leading-[1.35] text-ink-dim [&>code]:rounded-none [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto rounded-card border border-line-subtle">
            <table className="w-full border-collapse text-[12.5px]">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-elevated/70">{children}</thead>,
        th: ({ children }) => (
          <th className="border border-line-subtle px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-ink-dim">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-line-subtle px-3 py-2 align-top leading-5 text-ink-dim">
            {children}
          </td>
        ),
        input: ({ checked }) => (
          <input
            type="checkbox"
            defaultChecked={checked}
            disabled
            className="mr-1.5 align-middle accent-primary"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
