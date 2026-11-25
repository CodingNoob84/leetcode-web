# LeetCode Solver (web)

A Next.js front end for the same personal LeetCode workspace that exists as the
Expo/Android app in [`../leetcode-app`](../leetcode-app). Both apps read and write
**one Neon Postgres database** — progress, solutions and notes are the same rows
on both sides.

The web app is the desktop counterpart: a fast dashboard, searchable problem
catalog, pattern-by-pattern study pages and an in-browser solution editor.

## Stack

- Next.js 16 (App Router, React 19, Server Components + Server Actions)
- Tailwind CSS v4 with the "Obsidian" dark design tokens from the mobile app
- Drizzle ORM + `@neondatabase/serverless` (SQL over HTTPS — no TCP pooler)
- `prism-react-renderer` for Python syntax highlighting in solution blocks
- Zod for validating every write

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env` from the example and point it at the same Neon database the
   mobile app uses:

   ```sh
   cp .env.example .env
   ```

   `.env` in this repo already contains the value copied from
   `leetcode-app/.env` (`DATABASE_URL`, plus `EXPO_PUBLIC_NEON_URL` kept in sync
   so both apps stay pointed at one database). It is git-ignored.

   The mobile app inlines its connection string into the app bundle, so it uses
   the least-privilege `app_sync` role there. This web app keeps the value on
   the server only, so the owner role is fine for local development.

3. Start the dev server:

   ```sh
   npm run dev
   ```

   Open <http://localhost:3000>.

## Scripts

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the Next.js dev server     |
| `npm run build`     | Production build                 |
| `npm run start`     | Serve the production build       |
| `npm run typecheck` | `tsc --noEmit`                   |
| `npm run lint`      | ESLint (Next.js flat config)      |

## Pages

| Route            | What it shows                                                     |
| ---------------- | ----------------------------------------------------------------- |
| `/`              | Progress hero, "up next" problem, per-topic progress              |
| `/problems`      | Full catalog with search + state/difficulty/topic filters         |
| `/problems/[id]` | Statement, examples, constraints, test cases, solutions, notes, rating |
| `/topics`        | Topics with progress                                             |
| `/topics/[id]`   | Sub-patterns with "how to spot it" / strategy guides and problems |
| `/lists`         | Curated study lists (Blind 75, NeetCode 150, …)                   |
| `/lists/[id]`    | Ordered problems of one list                                      |
| `/articles`      | Markdown study notes discovered from the repository's `articles/` folder |
| `/articles/[id]` | A rendered Markdown article                                      |
| `/revisit`      | Spaced-repetition queue: due now and coming up                    |
| `/mastered`     | Problems rated 5                                                  |

Articles are read directly from Markdown files under `articles/`; they are not
stored in or fetched from the database. Article IDs are generated from each
file's relative path, so adding a Markdown file automatically adds it to the
articles page.

## How it shares data with the mobile app

- Same tables, same shapes (`src/lib/db/schema.ts` mirrors
  `leetcode-app/lib/db/schema.pg.ts`).
- Writes go straight to Neon through server actions
  (`src/app/actions.ts`): rating a problem, creating/editing/deleting a
  solution, saving a note.
- Every write stamps `updated_at` with the current ms-epoch and lets the
  database's `bump_sync_rev` trigger assign a new `rev`, so the Android app
  picks the change up on its next **Sync** (last-write-wins on `updated_at`).

## Caching

A Neon round-trip from a home connection takes 1–3 s, while the content itself
changes rarely. Everything read-only is therefore cached on disk
(`src/lib/db/cache.ts`, folder `.cache/`, git-ignored):

| Key             | Content                                                        | Query cost             |
| --------------- | -------------------------------------------------------------- | ---------------------- |
| `catalog`       | problems, topics, patterns, lists, progress                    | 1 request              |
| `sub_<id>`      | every problem of one pattern + its solutions, notes, test cases | 1 bulk request         |
| `problem_<id>`  | one problem (for problems without a pattern)                     | 1 request              |
| `list_<id>`     | one curated list                                                | 1 request              |

- **Stale-while-revalidate** — a stale entry is served immediately and
  refreshed in the background, so pages never wait on Neon after the first hit.
- **TTL** is 6 h (`CACHE_TTL_MS` to override) and the folder can be moved with
  `CACHE_DIR`.
- **Invalidation** is explicit: rating a problem drops only `catalog`;
  solution/note edits drop the pattern bundles and problem/list entries. A
  manual **Refresh from Neon** button in the sidebar drops everything.
- **After editing content in the database** (descriptions, examples, solutions)
  bump `CACHE_VERSION` in `src/lib/db/cache.ts` (or clear `.cache/`), otherwise
  the old text keeps being served from the cached bundles.
- The disk file is the single source of truth (no in-process memo), because
  server actions and page renders can run in different module instances.

Warm page loads land around 50–200 ms; a cold load is one Neon request.

## Project structure

```
src/
  app/            Routes (App Router) + server actions
  components/     UI: nav, problem browser, solution editor, rating, notes
  lib/
    db/cache.ts   Disk cache with TTL + stale-while-revalidate
    db/client.ts  Neon (SQL-over-HTTPS) Drizzle client
    db/schema.ts  Postgres schema, identical to the mobile app
    db/queries.ts Batched reads (catalog + per-pattern bulk) and cache keys
    learn.ts      Rating / spaced-repetition model
    stats.ts      Dashboard aggregates
```
