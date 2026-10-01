"use client";

import { BookOpenCheck, FilePlus2, LocateFixed, Phone, PhoneCall, UserPlus, Volume2, VolumeX } from "lucide-react";

export function QuickActions({
  onShareLocation,
  onNewReport,
  onAddContact,
  onTriggerFakeCall,
  onToggleSiren,
  isSirenActive = false,
}: {
  onShareLocation: () => void;
  onNewReport: () => void;
  onAddContact: () => void;
  onTriggerFakeCall?: () => void;
  onToggleSiren?: () => void;
  isSirenActive?: boolean;
}) {
  const itemClass =
    "flex min-h-14 items-center gap-3 rounded-xl border border-line bg-white px-3 text-left text-sm font-medium text-ink transition hover:border-brand hover:bg-brand-50";
  return (
    <section aria-labelledby="quick-title" className="card">
      <p className="kicker">Shortcuts</p>
      <h2 id="quick-title" className="mt-1 text-lg font-bold">
        Quick actions
      </h2>
      <div className="mt-4 grid gap-2">
        <a href="tel:112" className={`${itemClass} hover:border-danger hover:bg-danger-50`}>
          <span className="grid size-9 place-items-center rounded-lg bg-danger-50 text-danger">
            <Phone size={18} aria-hidden />
          </span>
          Call 112 — all emergencies
        </a>

        {onToggleSiren && (
          <button
            type="button"
            onClick={onToggleSiren}
            className={`${itemClass} ${isSirenActive ? "border-danger bg-danger-50 text-danger animate-pulse" : "hover:border-danger hover:bg-danger-50"}`}
          >
            <span className={`grid size-9 place-items-center rounded-lg ${isSirenActive ? "bg-danger text-white" : "bg-danger-50 text-danger"}`}>
              {isSirenActive ? <Volume2 size={18} className="animate-spin" /> : <VolumeX size={18} />}
            </span>
            {isSirenActive ? "Stop Emergency Siren" : "Sound 100dB Audio Siren"}
          </button>
        )}

        {onTriggerFakeCall && (
          <button
            type="button"
            onClick={onTriggerFakeCall}
            className={`${itemClass} hover:border-safe hover:bg-safe-50`}
          >
            <span className="grid size-9 place-items-center rounded-lg bg-safe-50 text-safe">
              <PhoneCall size={18} aria-hidden />
            </span>
            Fake Call Shield (Escape aid)
          </button>
        )}

        <button type="button" onClick={onShareLocation} className={itemClass}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
            <LocateFixed size={18} aria-hidden />
          </span>
          Start live location
        </button>
        <button type="button" onClick={onNewReport} className={itemClass}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
            <FilePlus2 size={18} aria-hidden />
          </span>
          Report an incident
        </button>
        <button type="button" onClick={onAddContact} className={itemClass}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
            <UserPlus size={18} aria-hidden />
          </span>
          Add trusted contact
        </button>

        {/* Goa-specific quick links */}
        <div className="mt-1 pt-2 border-t border-line">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Goa Safety Tools</p>
          <div className="grid gap-1.5">
            <a href="/road-emergency" className={`${itemClass} hover:border-danger hover:bg-danger-50 !min-h-11`}>
              <span className="grid size-8 place-items-center rounded-lg bg-danger-50 text-danger text-base">🚨</span>
              Road Emergency + First Aid
            </a>
            <a href="/beach" className={`${itemClass} !min-h-11`}>
              <span className="grid size-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600 text-base">🏖</span>
              Beach Flag Status (Live)
            </a>
            <a href="/ferries" className={`${itemClass} !min-h-11`}>
              <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600 text-base">⚓</span>
              Ferry Status
            </a>
            <a href="/query" className={`${itemClass} !min-h-11`}>
              <span className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-600 text-base">✨</span>
              Ask AI — Goa Safety
            </a>
          </div>
        </div>

        <a href="#guidance" className={itemClass}>
          <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
            <BookOpenCheck size={18} aria-hidden />
          </span>
          Emergency guidance
        </a>
      </div>
    </section>
  );
}
