import "server-only";

import type { z } from "zod";
import { getCurrentUser, type SessionUser } from "./auth";

/** JSON error with a user-safe message (never internal details). */
export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init?.headers } });
}

/** Resolves the signed-in user or returns a 401 response. */
export async function requireUser(): Promise<SessionUser | Response> {
  try {
    const user = await getCurrentUser();
    return user ?? jsonError("Your session has expired. Please log in again.", 401);
  } catch {
    return jsonError("Authentication is temporarily unavailable.", 503);
  }
}

export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T> | Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be JSON.", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message || "Invalid request.", 400);
  }
  return parsed.data;
}
