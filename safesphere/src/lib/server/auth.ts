import "server-only";

import { betterAuth, type BetterAuthOptions } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { deleteUserData, getDb } from "./db";

/**
 * Authentication: Better Auth (https://better-auth.com).
 * - Email + password: hashed by Better Auth (scrypt); we never touch raw passwords.
 * - Google OAuth: enabled only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 * - Sessions: random tokens stored server-side in SQLite, sent as an httpOnly,
 *   SameSite=Lax cookie (Secure automatically when BETTER_AUTH_URL is https).
 */

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function buildOptions() {
  return {
    appName: "SafeSphere",
    database: getDb(),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      // No email service is configured in this prototype, so we cannot verify
      // addresses or send reset links. See docs/IMPLEMENTATION_REPORT.md.
      requireEmailVerification: false,
    },
    socialProviders: isGoogleConfigured()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            prompt: "select_account" as const,
          },
        }
      : {},
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // refresh expiry at most once a day
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user: { id: string }) => {
          deleteUserData(user.id);
        },
      },
    },
    // OAuth failures (cancelled consent, expired state) land on our login page as ?error=…
    onAPIError: { errorURL: "/login" },
    rateLimit: { enabled: true, window: 60, max: 30, storage: "memory" as const },
    telemetry: { enabled: false },
    plugins: [nextCookies()],
  } satisfies BetterAuthOptions;
}

function createAuth(options: ReturnType<typeof buildOptions>) {
  return betterAuth(options);
}

type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as { __safesphereAuth?: Promise<Auth> };

async function init(): Promise<Auth> {
  const options = buildOptions();
  // Create/upgrade Better Auth's tables on first use (idempotent).
  const { runMigrations } = await getMigrations(options);
  await runMigrations();
  return createAuth(options);
}

/** Lazily created so `next build` never opens the database. */
export function getAuth() {
  globalForAuth.__safesphereAuth ??= init().catch((error) => {
    globalForAuth.__safesphereAuth = undefined;
    throw error;
  });
  return globalForAuth.__safesphereAuth;
}

export type SessionUser = { id: string; name: string; email: string; image: string | null };

/** Server-verified session for the current request (null when signed out or expired). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // Read headers first: during `next build` this marks the page dynamic before any DB access.
  const requestHeaders = await headers();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
}
