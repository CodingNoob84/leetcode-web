"use client";

import { useEffect, useState } from "react";

export function ArticleReadingControls() {
  const [progress, setProgress] = useState(0);
  const [navigationVisible, setNavigationVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight <= 0
          ? 100
          : Math.round((window.scrollY / scrollableHeight) * 100);
      setProgress(Math.max(0, Math.min(100, nextProgress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    const navigation = document.querySelector("[data-article-navigation]");
    const observer = navigation
      ? new IntersectionObserver(
          ([entry]) => setNavigationVisible(entry.isIntersecting),
          { rootMargin: "0px 0px 24px 0px" },
        )
      : null;
    if (navigation && observer) observer.observe(navigation);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      observer?.disconnect();
    };
  }, []);

  if (navigationVisible) return null;

  return (
    <aside
      style={{ position: "fixed", right: "1rem", bottom: "1rem", zIndex: 50 }}
      className="flex items-center gap-1 rounded-full border border-line bg-card/95 p-1.5 shadow-lg backdrop-blur"
    >
      <div
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="min-w-[3.75rem] px-1.5 text-center text-[11px] font-semibold tabular-nums text-ink-dim"
      >
        {progress}% read
      </div>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle text-base text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() =>
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          })
        }
        aria-label="Scroll to bottom"
        title="Scroll to bottom"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-line-subtle text-base text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
      >
        ↓
      </button>
    </aside>
  );
}
