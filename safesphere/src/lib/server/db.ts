import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Single SQLite database (Node's built-in `node:sqlite`, no native build step).
 * Holds Better Auth's tables (user, session, account, verification) plus the
 * app's own per-user tables below. Every app query is scoped by `user_id`.
 *
 * Prototype choice: one file on local disk. It suits a single server or a demo
 * laptop; a serverless/multi-instance deployment needs a hosted database
 * (Postgres, Turso/libSQL, etc. — Better Auth supports both).
 */

const globalForDb = globalThis as unknown as { __safesphereDb?: DatabaseSync };

function open() {
  const defaultPath = process.env.VERCEL
    ? path.join("/tmp", "safesphere.db")
    : path.join(process.cwd(), "data", "safesphere.db");
  const file = process.env.SAFESPHERE_DB_PATH || defaultPath;
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relation TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS contacts_user_idx ON contacts (user_id);

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      lat REAL,
      lng REAL,
      accuracy REAL,
      assist TEXT,
      shared INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS reports_user_idx ON reports (user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS reports_shared_idx ON reports (shared, created_at DESC);
  `);
  return db;
}

export function getDb() {
  globalForDb.__safesphereDb ??= open();
  return globalForDb.__safesphereDb;
}

/** Removes every app record a user owns. Called on "delete my data" and before account deletion. */
export function deleteUserData(userId: string) {
  const db = getDb();
  const contacts = db.prepare("DELETE FROM contacts WHERE user_id = ?").run(userId).changes;
  const reports = db.prepare("DELETE FROM reports WHERE user_id = ?").run(userId).changes;
  return { contacts: Number(contacts), reports: Number(reports) };
}
