import type { GeoPoint } from "./types";

export function formatDateTime(value: number) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTime(value: number) {
  return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatCoords(point: Pick<GeoPoint, "lat" | "lng">) {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

export function mapsLink(point: Pick<GeoPoint, "lat" | "lng">) {
  return `https://www.google.com/maps?q=${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
}

export function osmLink(point: Pick<GeoPoint, "lat" | "lng">) {
  return `https://www.openstreetmap.org/?mlat=${point.lat.toFixed(6)}&mlon=${point.lng.toFixed(6)}#map=17/${point.lat.toFixed(6)}/${point.lng.toFixed(6)}`;
}

export function distanceKm(a: Pick<GeoPoint, "lat" | "lng">, b: Pick<GeoPoint, "lat" | "lng">) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Digits with optional leading +, 7–15 digits (E.164 upper bound). */
export function normalizePhone(input: string) {
  const trimmed = input.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

export function validatePhone(input: string): string | null {
  if (!input.trim()) return "Enter a phone number.";
  if (/[^\d+\s()-]/.test(input)) return "Use digits only (spaces, dashes and a leading + are fine).";
  const normalized = normalizePhone(input);
  const digits = normalized.replace("+", "");
  if (digits.length < 7 || digits.length > 15) return "Phone numbers need 7–15 digits.";
  if (!normalized.startsWith("+") && digits.length === 10 && !/^[6-9]/.test(digits)) {
    return "Indian mobile numbers start with 6, 7, 8 or 9. Add a country code for other numbers.";
  }
  return null;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
