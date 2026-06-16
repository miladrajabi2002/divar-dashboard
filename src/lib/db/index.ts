import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "divar.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Ensure the daily-series table exists for databases created before this migration.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS post_stats_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    post_token TEXT NOT NULL,
    brand_token TEXT NOT NULL,
    metric TEXT NOT NULL,
    date_label TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    today_total INTEGER DEFAULT 0,
    grand_total INTEGER DEFAULT 0,
    fetched_at INTEGER DEFAULT (unixepoch())
  )
`);

export const db = drizzle(sqlite, { schema });
export { schema };
