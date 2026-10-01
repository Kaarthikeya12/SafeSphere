"use client";

import { AlertTriangle, CircleDot, Clock3, Siren } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { CheckIn, SosState } from "@/lib/types";
import type { GeoStatus } from "@/lib/use-geolocation";

/**
 * Reflects only real app state (SOS, check-in timer, location watcher,
 * saved contacts). It never claims the user is "safe".
 */
export function StatusBanner({
  sos,
  checkIn,
  checkInExpired,
  geoStatus,
  hasPosition,
  contactsCount,
}: {
  sos: SosState | null;
  checkIn: CheckIn | null;
  checkInExpired: boolean;
  geoStatus: GeoStatus;
  hasPosition: boolean;
  contactsCount: number;
}) {
  let tone: "danger" | "info" | "neutral" = "neutral";
  let Icon = CircleDot;
  let title = "No SOS or check-in running";
  let detail = "Start a check-in before heading out alone.";

  if (sos) {
    tone = "danger";
    Icon = Siren;
    title = `SOS active since ${formatTime(sos.activatedAt)}`;
    detail = "No one has been contacted automatically. Call 112 or share your message.";
  } else if (checkIn && checkInExpired) {
    tone = "danger";
    Icon = AlertTriangle;
    title = "Check-in overdue";
    detail = "Tap “I’m safe”, extend, or get help. No one was notified automatically.";
  } else if (checkIn) {
    tone = "info";
    Icon = Clock3;
    title = `Check-in due at ${formatTime(checkIn.deadline)}`;
    detail = checkIn.label ? `“${checkIn.label}”` : "Tap “I’m safe” when you arrive.";
  }

  const styles = {
    danger: "border-danger-100 bg-danger-50 text-danger",
    info: "border-brand-100 bg-brand-50 text-brand",
    neutral: "border-line bg-white text-muted",
  }[tone];

  const location =
    geoStatus === "watching"
      ? { text: "Location: sharing live", dot: "bg-safe" }
      : geoStatus === "locating"
        ? { text: "Location: locating…", dot: "bg-brand" }
        : geoStatus === "error" || geoStatus === "unsupported"
          ? { text: "Location: unavailable", dot: "bg-warn" }
          : hasPosition
            ? { text: "Location: last known", dot: "bg-warn" }
            : { text: "Location: off", dot: "bg-line-strong" };

  return (
    <section aria-label="Safety status" aria-live="polite" className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center ${styles}`}>
      <div className="flex flex-1 items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone === "neutral" ? "bg-surface" : "bg-white"}`}>
          <Icon size={20} aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-sm text-body">{detail}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`chip gap-1.5 ${tone === "neutral" ? "bg-surface" : "bg-white"} text-body`}>
          <span className={`size-2 rounded-full ${location.dot}`} aria-hidden />
          {location.text}
        </span>
        <span className={`chip ${tone === "neutral" ? "bg-surface" : "bg-white"} ${contactsCount ? "text-body" : "text-warn"}`}>
          {contactsCount ? `${contactsCount} trusted contact${contactsCount > 1 ? "s" : ""}` : "No contacts yet"}
        </span>
      </div>
    </section>
  );
}
