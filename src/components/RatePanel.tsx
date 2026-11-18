"use client";

import { ago, level } from "@/lib/learn";
import { RatingButtons } from "./RatingButtons";

export function RatePanel({
  problemId,
  confidence,
  reviewedAt,
  learned,
}: {
  problemId: string;
  confidence?: number | null;
  reviewedAt?: number | null;
  learned: boolean;
}) {
  const lvl = level(confidence);

  return (
    <div className="rounded-card border border-line-subtle bg-card p-4">
      <RatingButtons problemId={problemId} confidence={confidence} />

      <p className="mt-3 text-[11.5px] text-placeholder">
        1 = revisit again and again · 5 = no revisit needed
        {reviewedAt && lvl ? ` · rated ${ago(reviewedAt)}` : ""}
        {learned && !lvl ? " · learned" : ""}
      </p>
    </div>
  );
}
