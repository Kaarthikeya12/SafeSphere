"use client";

import { useState, type FormEvent } from "react";
import { Copy, Loader2, Pencil, Phone, Trash2, UserPlus, Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { copyText, normalizePhone, validatePhone } from "@/lib/format";
import type { Contact } from "@/lib/types";
import { MAX_CONTACTS, RELATIONS, validateContactName } from "@/lib/validation";
import type { ToastMessage } from "./toast";

export type ContactDraft = { name: string; phone: string; relation: (typeof RELATIONS)[number] };
const EMPTY: ContactDraft = { name: "", phone: "", relation: "Family" };

export function ContactsPanel({
  contacts,
  onSave,
  onDelete,
  notify,
  formOpen,
  setFormOpen,
}: {
  contacts: Contact[];
  /** Resolves to an error message, or null on success. */
  onSave: (draft: ContactDraft, editingId: string | null) => Promise<string | null>;
  onDelete: (contact: Contact) => Promise<void>;
  notify: (message: string, tone?: ToastMessage["tone"]) => void;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDraft | "form", string>>>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function open(contact?: Contact) {
    setEditingId(contact?.id ?? null);
    setDraft(
      contact
        ? { name: contact.name, phone: contact.phone, relation: (RELATIONS as readonly string[]).includes(contact.relation) ? (contact.relation as ContactDraft["relation"]) : "Other" }
        : EMPTY,
    );
    setErrors({});
    setFormOpen(true);
  }

  function close() {
    setFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY);
    setErrors({});
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    const nameError = validateContactName(draft.name);
    if (nameError) next.name = nameError;
    const phoneError = validatePhone(draft.phone);
    if (phoneError) next.phone = phoneError;
    const phone = normalizePhone(draft.phone);
    if (!phoneError && contacts.some((c) => c.phone === phone && c.id !== editingId)) next.phone = "This number is already saved.";
    if (!editingId && contacts.length >= MAX_CONTACTS) next.form = `You can save up to ${MAX_CONTACTS} contacts.`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const error = await onSave({ ...draft, name: draft.name.trim() }, editingId);
    setBusy(false);
    if (error) {
      setErrors({ form: error });
      return;
    }
    close();
  }

  return (
    <section id="contacts" aria-labelledby="contacts-title" className="card scroll-mt-32 lg:scroll-mt-20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Trusted contacts</p>
          <h2 id="contacts-title" className="mt-1 flex items-center gap-2 text-lg font-bold">
            People you’d call
            <span className="chip bg-brand-50 text-brand">{contacts.length}</span>
          </h2>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => open()} disabled={contacts.length >= MAX_CONTACTS}>
          <UserPlus size={14} aria-hidden /> Add
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-line-strong p-6 text-center">
          <Users size={24} className="text-brand" aria-hidden />
          <p className="mt-2 text-sm font-medium text-ink">No trusted contacts yet</p>
          <p className="mt-1 text-xs text-muted">Add two or three people who would pick up at any hour.</p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {contacts.map((contact) => (
            <li key={contact.id} className="py-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-ink-soft" aria-hidden>
                  {contact.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{contact.name}</p>
                  <p className="truncate text-xs text-muted">
                    {contact.relation} · {contact.phone}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <a href={`tel:${contact.phone}`} className="btn btn-ghost btn-sm px-2 text-safe" aria-label={`Call ${contact.name}`}>
                    <Phone size={16} aria-hidden />
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm px-2"
                    aria-label={`Copy ${contact.name}'s number`}
                    onClick={async () => notify((await copyText(contact.phone)) ? "Number copied." : "Couldn’t copy the number.", "info")}
                  >
                    <Copy size={16} aria-hidden />
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm px-2" aria-label={`Edit ${contact.name}`} onClick={() => open(contact)}>
                    <Pencil size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm px-2 hover:text-danger"
                    aria-label={`Delete ${contact.name}`}
                    onClick={() => setPendingDelete(contact.id)}
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              </div>
              {pendingDelete === contact.id && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-danger-50 px-3 py-2 text-sm">
                  <span className="text-ink">Remove {contact.name}?</span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setPendingDelete(null);
                        void onDelete(contact);
                      }}
                    >
                      Remove
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPendingDelete(null)}>
                      Cancel
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">Private to your account. Contacts aren’t notified or messaged by SafeSphere.</p>

      <Modal
        open={formOpen}
        onClose={close}
        title={editingId ? "Edit contact" : "Add trusted contact"}
        description="Someone who would pick up at any hour."
      >
        <form noValidate onSubmit={(event) => void submit(event)} className="space-y-4">
          {errors.form && (
            <p role="alert" className="rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm text-danger">
              {errors.form}
            </p>
          )}
          <div>
            <label htmlFor="contact-name" className="field-label">
              Name
            </label>
            <input
              id="contact-name"
              className="field"
              autoComplete="off"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name && <p id="contact-name-error" className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-phone" className="field-label">
              Phone number
            </label>
            <input
              id="contact-phone"
              className="field"
              type="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "contact-phone-error" : "contact-phone-hint"}
            />
            {errors.phone ? (
              <p id="contact-phone-error" className="field-error">{errors.phone}</p>
            ) : (
              <p id="contact-phone-hint" className="mt-1.5 text-xs text-muted">10-digit Indian mobile, or include the country code.</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-relation" className="field-label">
              Relationship
            </label>
            <select id="contact-relation" className="field" value={draft.relation} onChange={(e) => setDraft({ ...draft, relation: e.target.value as ContactDraft["relation"] })}>
              {RELATIONS.map((relation) => (
                <option key={relation}>{relation}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-primary flex-1" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" aria-hidden />}
              {editingId ? "Save changes" : "Add contact"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
