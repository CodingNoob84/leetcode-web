import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-4xl font-extrabold tracking-tight text-ink">404</p>
      <h1 className="mt-2 text-lg font-semibold text-ink-dim">Nothing here</h1>
      <p className="mt-2 text-sm text-muted">
        That problem, topic, tag or list is not in the database.
      </p>
      <Link
        href="/problems"
        className="mt-6 inline-block rounded-card bg-primary px-4 py-2 text-xs font-bold text-canvas"
      >
        Browse problems
      </Link>
    </div>
  );
}
