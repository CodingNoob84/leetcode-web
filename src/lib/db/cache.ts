import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// ---------------------------------------------------------------------------
// Disk-backed content cache.
//
// The catalog (problems, topics, patterns, lists) and the per-pattern content
// bundles change rarely, but a Neon round-trip from a home connection takes
// 1-3 s. Everything read-only is therefore cached on disk with a long TTL and
// served stale-while-revalidate: a stale entry is returned immediately and
// refreshed in the background, so the UI never waits on Neon after the first
// hit.
//
// Writes invalidate the affected keys explicitly (see queries.ts).
// ---------------------------------------------------------------------------

const CACHE_DIR =
  process.env.CACHE_DIR ?? path.join(process.cwd(), ".cache");

export const DEFAULT_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);

/**
 * Bump when the shape of a cached payload changes — every key changes with
 * it, so stale entries can never be read back.
 */
const CACHE_VERSION = "v24";

export interface CacheEntry<T> {
  data: T;
  storedAt: number;
  ttlMs: number;
}

const safeKey = (key: string) =>
  `${CACHE_VERSION}_${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

const fileFor = (key: string) => path.join(CACHE_DIR, `${safeKey(key)}.json`);

async function ensureDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

export async function readCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await readFile(fileFor(key), "utf8");
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

/** Atomic write: a temp file + rename, so a crash never leaves half a file. */
export async function writeCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS) {
  try {
    await ensureDir();
    const file = fileFor(key);
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    const entry: CacheEntry<T> = { data, storedAt: Date.now(), ttlMs };
    await writeFile(tmp, JSON.stringify(entry), "utf8");
    await rename(tmp, file);
  } catch {
    // A cache write must never break a page.
  }
}

/** Drop one key, every key with a prefix, or the whole cache. */
export async function invalidateCache(prefix?: string) {
  if (!prefix) {
    try {
      await rm(CACHE_DIR, { recursive: true, force: true });
    } catch {
      // ignore
    }
    return;
  }
  try {
    await ensureDir();
    const files = await readdir(CACHE_DIR);
    const target = safeKey(prefix);
    await Promise.all(
      files
        .filter((f) => f.startsWith(target))
        .map((f) => rm(path.join(CACHE_DIR, f), { force: true })),
    );  } catch {
    // ignore
  }
}

/**
 * Read-through cache with stale-while-revalidate.
 *
 * The disk file is the only source of truth: server actions and page renders
 * can run in different module instances, so an in-memory memo would keep
 * serving data that a write just invalidated. Reading a small JSON file costs
 * far less than a Neon round-trip.
 *
 * - fresh entry  -> returned as is
 * - stale entry  -> returned immediately, refreshed in the background
 * - missing      -> loaded once and stored
 */
export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();

  const entry = await readCache<T>(key);
  if (entry) {
    if (now - entry.storedAt < entry.ttlMs) return entry.data;

    // Stale: serve it now, refresh behind the scenes.
    void loader()
      .then((fresh) => writeCache(key, fresh, ttlMs))
      .catch(() => {
        // Keep serving the stale copy.
      });
    return entry.data;
  }

  const data = await loader();
  await writeCache(key, data, ttlMs);
  return data;
}

/** Cache status for the UI (debug panel / manual refresh). */
export async function cacheStats() {
  let files = 0;
  let bytes = 0;
  try {
    const names = await readdir(CACHE_DIR);
    files = names.filter((f) => f.endsWith(".json")).length;
  } catch {
    // ignore
  }
  return { dir: CACHE_DIR, files, bytes };
}
