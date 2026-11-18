"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshContentCache } from "@/app/actions";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const refresh = () => {
    startTransition(async () => {
      await refreshContentCache();
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-card border border-line px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink-dim disabled:opacity-50"
    >
      <span className={pending ? "animate-spin" : ""}>⟳</span>
      {pending ? "Refreshing…" : done ? "Cache refreshed" : "Refresh from Neon"}
    </button>
  );
}
