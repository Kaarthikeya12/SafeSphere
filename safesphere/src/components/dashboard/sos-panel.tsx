"use client";

import { useState } from "react";
import { AlertTriangle, Copy, Loader2, MapPin, MessageSquareText, Phone, RefreshCw, Share2, ShieldCheck, Siren } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { copyText, formatCoords, formatDateTime, mapsLink } from "@/lib/format";
import type { Contact, SosState } from "@/lib/types";
import type { ToastMessage } from "./toast";

export function buildSosMessage(name: string, sos: SosState) {
  const lines = [`EMERGENCY: ${name} needs help.`, `Time: ${formatDateTime(sos.activatedAt)}`];
  if (sos.location) {
    lines.push(
      `Location: ${formatCoords(sos.location)}${sos.location.accuracy ? ` (±${sos.location.accuracy} m)` : ""}`,
      mapsLink(sos.location),
    );
  } else {
    lines.push("Location: not available — please call me.");
  }
  lines.push("Please call me or dial 112. (Sent manually via SafeSphere)");
  return lines.join("\n");
}

function smsHref(phone: string, body: string) {
  // "?&body=" is understood by both iOS and Android messaging apps.
  return `sms:${phone}?&body=${encodeURIComponent(body)}`;
}

export function SosConfirmModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      tone="danger"
      title="Activate SOS?"
      description="SafeSphere will timestamp this alert, try to get your location, and prepare a message you can call, copy or share."
    >
      <div className="flex gap-3 rounded-xl border border-warn-100 bg-warn-50 p-3 text-sm text-ink-soft">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
        <p>
          <strong className="text-ink">It will not contact anyone automatically.</strong> You stay in control of every call and message.
          If you are in immediate danger, call 112 now.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href="tel:112" className="btn btn-secondary h-12 border-danger-100 text-danger">
          <Phone size={18} aria-hidden /> Call 112 now
        </a>
        <button type="button" className="btn btn-danger h-12" onClick={onConfirm} autoFocus>
          <Siren size={18} aria-hidden /> Activate SOS
        </button>
      </div>
      <button type="button" className="btn btn-ghost mt-3 w-full" onClick={onClose}>
        Cancel
      </button>
    </Modal>
  );
}

export function SosPanel({
  sos,
  userName,
  contacts,
  geoError,
  onRequestActivate,
  onEnd,
  onRetryLocation,
  notify,
}: {
  sos: SosState | null;
  userName: string;
  contacts: Contact[];
  geoError: string | null;
  onRequestActivate: () => void;
  onEnd: () => void;
  onRetryLocation: () => void;
  notify: (message: string, tone?: ToastMessage["tone"]) => void;
}) {
  const [opened, setOpened] = useState<Record<string, true>>({});
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (!sos) {
    return (
      <section id="sos" aria-labelledby="sos-title" className="card scroll-mt-32 border-danger-100 lg:scroll-mt-20">
        <p className="text-xs font-semibold tracking-[0.12em] text-danger uppercase">Emergency</p>
        <h2 id="sos-title" className="mt-1 text-lg font-bold">
          SOS
        </h2>
        <p className="mt-1 text-sm text-muted">Prepares 112, your location and a message to share.</p>
        <button
          type="button"
          onClick={onRequestActivate}
          className="mt-5 grid h-32 w-full place-items-center rounded-2xl bg-danger text-white shadow-[0_8px_24px_rgb(200_30_30/0.25)] transition hover:bg-danger-600 focus-visible:outline-danger"
        >
          <span className="flex flex-col items-center gap-1">
            <Siren size={32} aria-hidden />
            <span className="text-2xl font-extrabold tracking-[0.2em]">SOS</span>
          </span>
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
          <ShieldCheck size={14} className="text-safe" aria-hidden /> Asks to confirm. Never sends anything by itself.
        </p>
      </section>
    );
  }

  const message = buildSosMessage(userName, sos);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <section id="sos" aria-labelledby="sos-title" className="card scroll-mt-32 border-2 border-danger lg:row-span-2 lg:scroll-mt-20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-danger uppercase">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2.5 rounded-full bg-danger" />
            </span>
            SOS active
          </p>
          <h2 id="sos-title" className="mt-1 text-lg font-bold">
            Get help now
          </h2>
          <p className="text-xs text-muted">Activated {formatDateTime(sos.activatedAt)}</p>
        </div>
      </div>

      <a href="tel:112" className="btn btn-danger mt-4 h-14 w-full text-lg">
        <Phone size={20} aria-hidden /> Call 112
      </a>

      <div className="mt-4 rounded-xl border border-line bg-surface p-3 text-sm">
        <p className="flex items-center gap-2 font-medium text-ink">
          <MapPin size={16} className="text-brand" aria-hidden />
          {sos.location ? (
            <>
              {formatCoords(sos.location)}
              {sos.location.accuracy ? <span className="font-normal text-muted">±{sos.location.accuracy} m</span> : null}
            </>
          ) : sos.locationError ? (
            <span className="text-danger">{sos.locationError}</span>
          ) : (
            <span className="flex items-center gap-2 font-normal text-muted">
              <Loader2 size={14} className="animate-spin" aria-hidden /> Getting your location…
            </span>
          )}
        </p>
        {!sos.location && sos.locationError && (
          <>
            {geoError && <p className="mt-1 text-xs text-muted">{geoError}</p>}
            <button type="button" onClick={onRetryLocation} className="btn btn-ghost btn-sm mt-2 px-2 text-brand">
              <RefreshCw size={14} aria-hidden /> Try location again
            </button>
          </>
        )}
      </div>

      <label htmlFor="sos-message" className="mt-4 block text-xs font-semibold tracking-wide text-muted uppercase">
        Message to share
      </label>
      <textarea id="sos-message" readOnly value={message} rows={5} className="field mt-1.5 resize-none bg-surface font-mono text-xs leading-relaxed" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => notify((await copyText(message)) ? "SOS message copied." : "Couldn’t copy. Select the text and copy it manually.", "info")}
        >
          <Copy size={14} aria-hidden /> Copy
        </button>
        {canShare ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigator.share({ title: "SOS", text: message }).catch(() => undefined)}
          >
            <Share2 size={14} aria-hidden /> Share…
          </button>
        ) : (
          <a className="btn btn-secondary btn-sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
            <Share2 size={14} aria-hidden /> WhatsApp
          </a>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Trusted contacts</p>
        {contacts.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted">No contacts saved yet.</p>
        ) : (
          <ul className="mt-1.5 divide-y divide-line rounded-xl border border-line">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{contact.name}</p>
                  {opened[contact.id] && <p className="text-xs text-warn">SMS draft opened — press send in your messages app</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <a href={`tel:${contact.phone}`} className="btn btn-ghost btn-sm px-2" aria-label={`Call ${contact.name}`}>
                    <Phone size={16} aria-hidden />
                  </a>
                  <a
                    href={smsHref(contact.phone, message)}
                    onClick={() => setOpened((current) => ({ ...current, [contact.id]: true }))}
                    className="btn btn-ghost btn-sm px-2"
                    aria-label={`Open SMS draft to ${contact.name}`}
                  >
                    <MessageSquareText size={16} aria-hidden />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">SafeSphere can’t send SMS or confirm delivery. Messages go only when you send them.</p>
      </div>

      {confirmEnd ? (
        <div className="mt-4 rounded-xl border border-line p-3">
          <p className="text-sm font-medium text-ink">End SOS and mark yourself safe?</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className="btn btn-safe btn-sm flex-1" onClick={onEnd}>
              Yes, I’m safe
            </button>
            <button type="button" className="btn btn-secondary btn-sm flex-1" onClick={() => setConfirmEnd(false)}>
              Keep active
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => setConfirmEnd(true)}>
          <ShieldCheck size={16} className="text-safe" aria-hidden /> I’m safe — end SOS
        </button>
      )}
    </section>
  );
}
