import "server-only";

import type { z } from "zod";
import { isIncidentCategory } from "@/lib/triage";
import type { CommunityReport, Contact, IncidentReport } from "@/lib/types";
import type { ContactInput, ReportInput, ReportUpdate } from "@/lib/validation";
import { getDb } from "./db";

/**
 * Data access for per-user records. Every query takes the authenticated
 * user's id and includes it in the WHERE clause, so one user can never read
 * or modify another user's rows, even by guessing ids.
 */

type Row = Record<string, unknown>;

function toContact(row: Row): Contact {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    relation: String(row.relation),
    createdAt: Number(row.created_at),
  };
}

function toReport(row: Row): IncidentReport {
  const category = isIncidentCategory(row.category) ? row.category : "Other";
  let assist: IncidentReport["assist"];
  if (typeof row.assist === "string") {
    try {
      assist = JSON.parse(row.assist);
    } catch {
      assist = undefined;
    }
  }
  return {
    id: String(row.id),
    category,
    description: String(row.description),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    location:
      row.lat != null && row.lng != null
        ? { lat: Number(row.lat), lng: Number(row.lng), accuracy: row.accuracy != null ? Number(row.accuracy) : undefined }
        : undefined,
    assist,
    shared: Boolean(row.shared),
  };
}

// ── Contacts ────────────────────────────────────────────────────────────────

export function listContacts(userId: string) {
  return getDb()
    .prepare("SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at ASC")
    .all(userId)
    .map((row) => toContact(row as Row));
}

export function countContacts(userId: string) {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM contacts WHERE user_id = ?").get(userId) as Row;
  return Number(row.n);
}

export function phoneTaken(userId: string, phone: string, exceptId?: string) {
  const row = getDb()
    .prepare("SELECT id FROM contacts WHERE user_id = ? AND phone = ? AND id != ?")
    .get(userId, phone, exceptId ?? "");
  return Boolean(row);
}

export function createContact(userId: string, input: z.infer<typeof ContactInput>) {
  const now = Date.now();
  const id = crypto.randomUUID();
  getDb()
    .prepare("INSERT INTO contacts (id, user_id, name, phone, relation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, userId, input.name, input.phone, input.relation, now, now);
  return { id, ...input, createdAt: now } satisfies Contact;
}

export function updateContact(userId: string, id: string, input: z.infer<typeof ContactInput>) {
  const result = getDb()
    .prepare("UPDATE contacts SET name = ?, phone = ?, relation = ?, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(input.name, input.phone, input.relation, Date.now(), id, userId);
  if (!result.changes) return null;
  return toContact(getDb().prepare("SELECT * FROM contacts WHERE id = ? AND user_id = ?").get(id, userId) as Row);
}

export function deleteContact(userId: string, id: string) {
  return getDb().prepare("DELETE FROM contacts WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}

// ── Reports ─────────────────────────────────────────────────────────────────

export function listReports(userId: string) {
  return getDb()
    .prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId)
    .map((row) => toReport(row as Row));
}

export function countReports(userId: string) {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM reports WHERE user_id = ?").get(userId) as Row;
  return Number(row.n);
}

export function createReport(userId: string, input: z.infer<typeof ReportInput>) {
  const now = Date.now();
  const id = crypto.randomUUID();
  const location = input.location ?? null;
  getDb()
    .prepare(
      `INSERT INTO reports (id, user_id, category, description, created_at, updated_at, lat, lng, accuracy, assist, shared)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      userId,
      input.category,
      input.description,
      now,
      now,
      location?.lat ?? null,
      location?.lng ?? null,
      location?.accuracy ?? null,
      input.assist ? JSON.stringify(input.assist) : null,
      input.shared ? 1 : 0,
    );
  return toReport(getDb().prepare("SELECT * FROM reports WHERE id = ?").get(id) as Row);
}

export function updateReport(userId: string, id: string, input: z.infer<typeof ReportUpdate>) {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM reports WHERE id = ? AND user_id = ?").get(id, userId) as Row | undefined;
  if (!existing) return null;
  const current = toReport(existing);
  db.prepare("UPDATE reports SET category = ?, description = ?, shared = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(
    input.category ?? current.category,
    input.description ?? current.description,
    (input.shared ?? current.shared) ? 1 : 0,
    Date.now(),
    id,
    userId,
  );
  return toReport(db.prepare("SELECT * FROM reports WHERE id = ? AND user_id = ?").get(id, userId) as Row);
}

export function deleteReport(userId: string, id: string) {
  return getDb().prepare("DELETE FROM reports WHERE id = ? AND user_id = ?").run(id, userId).changes > 0;
}

// ── Community feed ──────────────────────────────────────────────────────────

const COMMUNITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Reports their authors opted to share, from the last 7 days.
 * Never returns the author's id, name or email. Location is rounded to two
 * decimal places (roughly 1 km) so a shared report cannot pinpoint a home.
 */
export function listCommunityReports(viewerId: string, limit = 30): CommunityReport[] {
  return getDb()
    .prepare("SELECT id, user_id, category, description, created_at, lat, lng FROM reports WHERE shared = 1 AND created_at > ? ORDER BY created_at DESC LIMIT ?")
    .all(Date.now() - COMMUNITY_WINDOW_MS, limit)
    .map((value) => {
      const row = value as Row;
      return {
        id: String(row.id),
        category: isIncidentCategory(row.category) ? row.category : "Other",
        description: String(row.description),
        createdAt: Number(row.created_at),
        area:
          row.lat != null && row.lng != null
            ? { lat: Math.round(Number(row.lat) * 100) / 100, lng: Math.round(Number(row.lng) * 100) / 100 }
            : undefined,
        mine: row.user_id === viewerId,
      };
    });
}
