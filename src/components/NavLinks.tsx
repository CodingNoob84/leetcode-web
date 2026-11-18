"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export function NavLinks({
  items,
  dueBadge,
  onNavigate,
}: {
  items: NavItem[];
  dueBadge?: ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-elevated text-ink"
                : "text-muted hover:bg-elevated/60 hover:text-ink-dim",
            ].join(" ")}
          >
            <span className={active ? "text-primary" : "text-placeholder"}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.href === "/revisit" ? dueBadge : null}
          </Link>
        );
      })}
    </nav>
  );
}
