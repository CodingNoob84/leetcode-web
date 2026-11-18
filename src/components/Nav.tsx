import { Suspense } from "react";
import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { RefreshButton } from "./RefreshButton";
import { getCatalog } from "@/lib/db/queries";
import { isDue, nowMs } from "@/lib/learn";

export function Nav() {
  const items = [
    { href: "/", label: "Dashboard", icon: "⌂" },
    { href: "/problems", label: "Problems", icon: "☰" },
    { href: "/random", label: "Random", icon: "⚄" },
    { href: "/topics", label: "Topics", icon: "◇" },
    { href: "/tags", label: "Tags", icon: "#" },
    { href: "/lists", label: "Lists", icon: "▤" },
    { href: "/revisit", label: "Revisit", icon: "↻" },
    { href: "/mastered", label: "Mastered", icon: "✓" },
  ];

  return (
    <>
      <MobileNav
        items={items}
        dueBadge={
          <Suspense
            fallback={
              <span className="h-4 w-6 rounded-full bg-elevated" aria-hidden="true" />
            }
          >
            <DueBadge />
          </Suspense>
        }
      />

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line-subtle bg-card/60 px-4 py-6 md:flex">
        <Link href="/" className="mb-8 block">
          <span className="text-lg font-bold tracking-tight text-ink">LeetCode</span>
          <span className="ml-1.5 text-lg font-bold tracking-tight text-primary">Solver</span>
          <p className="mt-1 text-xs text-muted">Obsidian workspace</p>
        </Link>

        <NavLinks
          items={items}
          dueBadge={
            <Suspense
              fallback={
                <span className="h-4 w-6 rounded-full bg-elevated" aria-hidden="true" />
              }
            >
              <DueBadge />
            </Suspense>
          }
        />

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
      </aside>
    </>
  );
}

/** The revisit counter needs the catalog, so it streams in behind Suspense. */
async function DueBadge() {
  const catalog = await getCatalog();
  const now = nowMs();
  const due = Object.keys(catalog.confidence).filter((id) =>
    isDue(catalog.confidence[id], catalog.reviewedAt[id], now),
  ).length;
  if (!due) return null;
  return (
    <span className="rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-extrabold text-canvas">
      {due > 99 ? "99+" : due}
    </span>
  );
}
