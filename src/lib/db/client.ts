import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon is reached over plain HTTPS (SQL-over-HTTP), so no TCP pooler or
// long-lived sockets are needed — the same URL works locally, on Vercel and
// in a container.
//
// @neondatabase/serverless is pinned to 0.10.x: drizzle-orm 0.36's neon-http
// driver calls neon() as a plain function, which 1.x forbids.
function connectionString() {
  const url = process.env.DATABASE_URL ?? process.env.EXPO_PUBLIC_NEON_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at the Neon database.",
    );
  }
  return url.trim();
}

export const db = drizzle(neon(connectionString()), { schema });

export type Db = typeof db;
