"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { NavLinks, type NavItem } from "./NavLinks";
import { RefreshButton } from "./RefreshButton";

export function MobileNav({ items, dueBadge }: { items: NavItem[]; dueBadge?: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-subtle bg-canvas/95 px-4 backdrop-blur md:hidden">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="text-base font-bold tracking-tight text-ink">LeetCode</span>
          <span className="text-base font-bold tracking-tight text-primary">Solver</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-10 w-10 items-center justify-center rounded-card border border-line-subtle text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 h-full w-full bg-canvas/70 backdrop-blur-sm transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-line-subtle bg-card px-4 py-5 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-start justify-between">
            <Link href="/" className="block">
              <span className="text-lg font-bold tracking-tight text-ink">LeetCode</span>
              <span className="ml-1.5 text-lg font-bold tracking-tight text-primary">Solver</span>
              <p className="mt-1 text-xs text-muted">Obsidian workspace</p>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="-mr-1 flex h-9 w-9 items-center justify-center rounded-card text-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          <NavLinks items={items} dueBadge={dueBadge} onNavigate={() => setOpen(false)} />

          <div className="mt-auto rounded-card border border-line-subtle bg-elevated/60 px-3 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-dim">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Live from Neon
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              Same database as the Android app. Edits made here sync to the phone.
            </p>
            <RefreshButton />
          </div>
        </div>
      </div>
    </>
  );
}
