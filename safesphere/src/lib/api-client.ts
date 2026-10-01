"use client";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

/**
 * Small fetch wrapper for SafeSphere's own API routes. On 401 it sends the
 * browser to /login (the server session expired or was revoked).
 */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, status: 0, error: "Can’t reach SafeSphere. Check your connection and try again." };
  }
  if (response.status === 401) {
    // Full reload on purpose: drops all in-memory state from the dead session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?reason=expired&next=${encodeURIComponent(window.location.pathname)}`);
    return { ok: false, status: 401, error: "Your session has expired." };
  }
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload ? String((payload as { error: unknown }).error) : null;
    return { ok: false, status: response.status, error: message || "Something went wrong. Please try again." };
  }
  return { ok: true, data: payload as T };
}
