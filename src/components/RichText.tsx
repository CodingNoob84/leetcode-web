import type { ReactNode } from "react";

// Lightweight markdown for problem statements: **bold**, *italic*, `code`,
// and blank-line separated paragraphs. Everything is rendered as plain text,
// so nothing is injected into the DOM.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-elevated px-1 py-0.5 font-mono text-[12.5px] text-secondary"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key} className="text-ink-dim">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).filter((block) => block.trim().length > 0);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const isNote = lines[0]?.trim().startsWith("**Note");
        return (
          <p key={index} className="text-[13.5px] leading-6 text-ink-dim">
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInline(line, `${index}-${lineIndex}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
