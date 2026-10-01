"use client";

import { BookOpenCheck, FilePlus2, LocateFixed, Phone, UserPlus } from "lucide-react";

export function QuickActions({
  onShareLocation,
  onNewReport,
  onAddContact,
}: {
  onShareLocation: () => void;
  onNewReport: () => void;
  onAddContact: () => void;
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
