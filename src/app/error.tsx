"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="text-4xl font-extrabold tracking-tight text-danger">Oops</p>
      <h1 className="mt-2 text-lg font-semibold text-ink">Something broke while loading</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        The database did not answer in time, or the page hit an unexpected state.
        The cached content is still fine - retrying usually works.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[11px] text-placeholder">ref {error.digest}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-card bg-primary px-4 py-2 text-xs font-bold text-canvas transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-card border border-line px-4 py-2 text-xs font-semibold text-ink-dim transition-colors hover:bg-elevated"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
