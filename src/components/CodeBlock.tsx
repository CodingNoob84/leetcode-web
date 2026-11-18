"use client";

import { Highlight, themes } from "prism-react-renderer";

// Python code blocks, syntax highlighted. The theme is merged with the app
// palette so the block still reads as part of the obsidian workspace.
export function CodeBlock({ code }: { code: string }) {
  const source = code || "# empty";

  return (
    <div className="mt-3 overflow-x-auto rounded-card border border-line-subtle bg-code">
      <Highlight theme={themes.vsDark} code={source} language="python">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} min-w-full text-[12.5px] leading-[1.6]`} style={{ ...style, background: "transparent", margin: 0, padding: 0 }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="flex">
                <span className="sticky left-0 w-11 shrink-0 select-none border-r border-line-subtle bg-code px-3 text-right text-placeholder">
                  {i + 1}
                </span>
                <span className="px-3">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
