"use client";

import { useState } from "react";
import { AlertTriangle, BellOff, CheckCircle2, Info, Plus, Siren, Timer, X } from "lucide-react";
import { formatCountdown, formatTime } from "@/lib/format";
import type { CheckIn } from "@/lib/types";

const PRESETS = [5, 15, 30] as const;
const MIN_CUSTOM = 1;
const MAX_CUSTOM = 240;

export function CheckInPanel({
  checkIn,
  now,
  expired,
  onStart,
  onExtend,
  onAcknowledge,
  onSafe,
  onCancel,
  onSos,
}: {
  checkIn: CheckIn | null;
  now: number;
  expired: boolean;
  onStart: (minutes: number, label?: string) => void;
  onExtend: (minutes: number) => void;
  onAcknowledge: () => void;
  onSafe: () => void;
  onCancel: () => void;
  onSos: () => void;
}) {
  const [choice, setChoice] = useState<number | "custom">(15);
  const [custom, setCustom] = useState("45");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const alarm = expired && !checkIn?.acknowledgedAt;

  const customMinutes = Number(custom);
  const minutes = choice === "custom" ? customMinutes : choice;

  return (
    <section id="checkin" aria-labelledby="checkin-title" className={`card scroll-mt-32 lg:scroll-mt-20 ${alarm ? "border-2 border-danger" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Check-in</p>
          <h2 id="checkin-title" className="mt-1 text-lg font-bold">
            Safety timer
          </h2>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
          <Timer size={20} aria-hidden />
        </span>
      </div>

      {!checkIn ? (
        <form
          className="mt-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!Number.isInteger(minutes) || minutes < MIN_CUSTOM || minutes > MAX_CUSTOM) {
              setError(`Choose a whole number of minutes from ${MIN_CUSTOM} to ${MAX_CUSTOM}.`);
              return;
            }
            setError(null);
            onStart(minutes, label.trim() || undefined);
            setLabel("");
          }}
        >
          <p className="text-sm text-muted">Tap “I’m safe” when you arrive.</p>
          <fieldset className="mt-4">
            <legend className="field-label">Duration</legend>
            <div className="grid grid-cols-4 gap-2">
              {[...PRESETS, "custom" as const].map((option) => (
                <label
                  key={option}
                  className={`flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-100 ${
                    choice === option ? "border-brand bg-brand-50 text-brand" : "border-line-strong text-body hover:bg-surface"
                  }`}
                >
                  <input type="radio" name="duration" value={option} checked={choice === option} onChange={() => setChoice(option)} className="sr-only" />
                  {option === "custom" ? "Other" : `${option}m`}
                </label>
              ))}
            </div>
          </fieldset>
          {choice === "custom" && (
            <div className="mt-3">
              <label htmlFor="checkin-custom" className="field-label">
                Minutes
              </label>
              <input
                id="checkin-custom"
                type="number"
                inputMode="numeric"
                min={MIN_CUSTOM}
                max={MAX_CUSTOM}
                step={1}
                className="field"
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "checkin-error" : undefined}
              />
            </div>
          )}
          {error && (
            <p id="checkin-error" className="field-error">
              {error}
            </p>
          )}
          <label htmlFor="checkin-label" className="field-label mt-3">
            Note <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="checkin-label"
            className="field"
            maxLength={60}
            placeholder="Walking home from the library"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <button type="submit" className="btn btn-primary mt-4 w-full">
            Start {Number.isFinite(minutes) && minutes > 0 ? `${minutes}-minute ` : ""}check-in
          </button>
        </form>
      ) : (
        <div className="mt-3">
          {checkIn.label && <p className="text-sm text-muted">“{checkIn.label}”</p>}
          {!expired ? (
            <div aria-live="off">
              <p className="mt-2 text-xs font-semibold tracking-wide text-muted uppercase">Time remaining</p>
              <p className="text-5xl font-bold text-ink tabular-nums" role="timer" aria-label={`${formatCountdown(checkIn.deadline - now)} remaining`}>
                {formatCountdown(checkIn.deadline - now)}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-linear"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((checkIn.deadline - now) / (checkIn.deadline - checkIn.startedAt)) * 100))}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">Due at {formatTime(checkIn.deadline)}</p>
            </div>
          ) : (
            <div role="alert" className={`mt-2 rounded-xl border p-3 ${alarm ? "border-danger-100 bg-danger-50" : "border-line bg-surface"}`}>
              <p className={`flex items-center gap-2 font-semibold ${alarm ? "text-danger" : "text-ink"}`}>
                <AlertTriangle size={18} aria-hidden /> Overdue since {formatTime(checkIn.deadline)}
              </p>
              <p className="mt-1 text-sm text-body">Are you okay? Confirm, extend, or get help.</p>
              {alarm && (
                <button type="button" className="btn btn-ghost btn-sm mt-2 px-2" onClick={onAcknowledge}>
                  <BellOff size={14} aria-hidden /> Dismiss alert
                </button>
              )}
            </div>
          )}

          <button type="button" className="btn btn-safe mt-4 h-12 w-full text-base" onClick={onSafe}>
            <CheckCircle2 size={18} aria-hidden /> I’m safe
          </button>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onExtend(5)}>
              <Plus size={14} aria-hidden /> 5m
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onExtend(15)}>
              <Plus size={14} aria-hidden /> 15m
            </button>
            {expired ? (
              <button type="button" className="btn btn-danger btn-sm" onClick={onSos}>
                <Siren size={14} aria-hidden /> SOS
              </button>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
                <X size={14} aria-hidden /> Cancel
              </button>
            )}
          </div>
          <p className="mt-3 flex gap-2 text-xs text-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            Alerts only on this device. Your contacts are not notified.
          </p>
        </div>
      )}
    </section>
  );
}
