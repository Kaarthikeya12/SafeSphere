"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Demo persistence layer: browser localStorage only.
 * Data never leaves this device. Every access is wrapped in try/catch because
 * storage can be unavailable (private mode, blocked site data, quota).
 */
const PREFIX = "safesphere:";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith(PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function readValue<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Returns false when the browser refused to store the value. */
export function writeValue<T>(key: string, value: T | null): boolean {
  let ok = true;
  try {
    if (value === null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    ok = false;
  }
  emit();
  return ok;
}

/**
 * React state backed by localStorage. `fallback` must be referentially stable
 * (a module-level constant), because it is also the server snapshot.
 */
export function useStoredState<T>(key: string | null, fallback: T) {
  const getSnapshot = useCallback((): T => {
    if (!key) return fallback;
    const raw = readRaw(key);
    const cached = cache.get(key);
    if (cached && cached.raw === raw) return cached.value as T;
    let value: T = fallback;
    if (raw !== null) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = fallback;
      }
    }
    cache.set(key, { raw, value });
    return value;
  }, [key, fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      if (!key) return false;
      const previous = getSnapshot();
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(previous) : next;
      return writeValue(key, resolved);
    },
    [key, getSnapshot],
  );

  return [value, setValue] as const;
}

const noopSubscribe = () => () => {};

/** True only after hydration on the client; avoids rendering browser-only UI on the server. */
export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
