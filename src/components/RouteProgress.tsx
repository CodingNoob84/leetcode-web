"use client";

// Rendered only while a route segment is resolving, so the bar disappears
// exactly when the real content replaces the skeleton.
export function RouteProgress() {
  return <div className="route-progress" aria-hidden="true" />;
}
