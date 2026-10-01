"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  FilePlus2,
  FileText,
  Info,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatCoords, formatDateTime, osmLink } from "@/lib/format";
import {
  INCIDENT_CATEGORIES,
  MAX_DESCRIPTION,
  MIN_DESCRIPTION,
  ruleBasedTriage,
  type IncidentCategory,
  type TriageResult,
} from "@/lib/triage";
import type { GeoPoint, IncidentReport } from "@/lib/types";
import type { Geolocation } from "@/lib/use-geolocation";

type EngineInfo = { aiConfigured: boolean; model: string | null } | null;

export type NewReport = {
  category: IncidentCategory;
  description: string;
  location: { lat: number; lng: number; accuracy?: number } | null;
  assist: IncidentReport["assist"] | null;
  shared: boolean;
};
export type ReportPatch = Partial<Pick<IncidentReport, "category" | "description" | "shared">>;

export function ReportsPanel({
  reports,
  geo,
  formOpen,
  setFormOpen,
  onCreate,
  onUpdate,
  onDelete,
}: {
  reports: IncidentReport[];
  geo: Geolocation;
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  /** Resolve to an error message, or null on success. */
  onCreate: (report: NewReport) => Promise<string | null>;
  onUpdate: (id: string, patch: ReportPatch) => Promise<string | null>;
  onDelete: (report: IncidentReport) => Promise<void>;
}) {
  const [showAll, setShowAll] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<IncidentReport | null>(null);
  const [engine, setEngine] = useState<EngineInfo>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/triage", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: EngineInfo) => setEngine(data))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const visible = showAll ? reports : reports.slice(0, 4);

  return (
    <section id="reports" aria-labelledby="reports-title" className="card scroll-mt-32 lg:col-span-2 lg:scroll-mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="kicker">Incident reports</p>
          <h2 id="reports-title" className="mt-1 flex items-center gap-2 text-lg font-bold">
            Your reports
            <span className="chip bg-brand-50 text-brand">{reports.length}</span>
          </h2>
        </div>
        <button type="button" className="btn btn-primary btn-sm self-start" onClick={() => setFormOpen(true)}>
          <FilePlus2 size={14} aria-hidden /> New report
        </button>
      </div>

      <EngineBadge engine={engine} />

      {reports.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-line-strong p-6 text-center">
          <FileText size={24} className="text-brand" aria-hidden />
          <p className="mt-2 text-sm font-medium text-ink">No reports yet</p>
          <p className="mt-1 text-xs text-muted">Spotted flooding, an open drain or an unsafe spot? Record it here.</p>
          <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setFormOpen(true)}>
            <FilePlus2 size={14} aria-hidden /> Create a report
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((report) => {
            const open = expanded === report.id;
            return (
              <li key={report.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-brand-50 text-brand">{report.category}</span>
                  <span className="chip border border-warn-100 bg-warn-50 text-warn" title="Not checked by any authority">
                    Unverified
                  </span>
                  {report.shared && (
                    <span className="chip bg-surface-2 text-body" title="An anonymised copy is visible to other signed-in users">
                      <Users size={12} aria-hidden /> Shared
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted">{formatDateTime(report.createdAt)}</span>
                </div>
                <p className={`mt-2 text-sm leading-relaxed break-words whitespace-pre-line text-ink ${open ? "" : "line-clamp-3"}`}>
                  {report.description}
                </p>

                {open && (
                  <dl className="mt-3 grid gap-2 rounded-xl bg-surface p-3 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-ink">Location</dt>
                      <dd className="mt-0.5 text-body">
                        {report.location ? (
                          <a href={osmLink(report.location)} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                            {formatCoords(report.location)}
                            {report.location.accuracy ? ` (±${Math.round(report.location.accuracy)} m)` : ""}
                          </a>
                        ) : (
                          "Not attached"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Visibility</dt>
                      <dd className="mt-0.5 text-body">{report.shared ? "Shared anonymously (area ~1 km)" : "Only you"}</dd>
                    </div>
                    {report.assist && (
                      <>
                        <div>
                          <dt className="font-semibold text-ink">Assistant</dt>
                          <dd className="mt-0.5 text-body">
                            {report.assist.engine === "claude" ? "Claude AI" : "Rule-based baseline (not AI)"} suggested “{report.assist.suggestedCategory}” (
                            {report.assist.confidence}) · {report.assist.accepted ? "accepted" : "you chose differently"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-ink">Summary</dt>
                          <dd className="mt-0.5 text-body">{report.assist.summary}</dd>
                        </div>
                      </>
                    )}
                    {report.updatedAt - report.createdAt > 1000 && (
                      <div>
                        <dt className="font-semibold text-ink">Edited</dt>
                        <dd className="mt-0.5 text-body">{formatDateTime(report.updatedAt)}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} aria-hidden /> {report.location ? "Location attached" : "No location"}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1 font-semibold text-brand hover:underline"
                      aria-expanded={open}
                      onClick={() => setExpanded(open ? null : report.id)}
                    >
                      {open ? "Less" : "Details"}
                      <ChevronDown size={12} className={open ? "rotate-180" : ""} aria-hidden />
                    </button>
                  </div>
                  {pendingDelete === report.id ? (
                    <span className="flex items-center gap-1 text-xs">
                      Delete?
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setPendingDelete(null);
                          void onDelete(report);
                        }}
                      >
                        Delete
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPendingDelete(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="flex">
                      <button type="button" className="btn btn-ghost btn-sm px-2" onClick={() => setEditing(report)} aria-label="Edit report">
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm px-2 hover:text-danger"
                        onClick={() => setPendingDelete(report.id)}
                        aria-label="Delete report"
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {reports.length > 4 && (
        <button type="button" className="btn btn-ghost btn-sm mt-3 text-brand" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show fewer" : `Show all ${reports.length} reports`}
        </button>
      )}
      <p className="mt-3 text-xs text-muted">Reports aren’t sent to police or any authority. To report a crime or emergency, call 112.</p>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title="New incident report"
        description="If someone is in danger right now, call 112 first."
      >
        {formOpen && <ReportForm geo={geo} engine={engine} onCancel={() => setFormOpen(false)} onSave={onCreate} onDone={() => setFormOpen(false)} />}
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit report">
        {editing && (
          <EditReportForm
            report={editing}
            onCancel={() => setEditing(null)}
            onSave={async (patch) => {
              const error = await onUpdate(editing.id, patch);
              if (!error) setEditing(null);
              return error;
            }}
          />
        )}
      </Modal>
    </section>
  );
}

function EngineBadge({ engine }: { engine: EngineInfo }) {
  if (!engine) return null;
  return (
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-body">
      {engine.aiConfigured ? <Bot size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden /> : <Info size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden />}
      {engine.aiConfigured ? (
        <span>
          <strong className="text-ink">AI assist on</strong> ({engine.model}). Text is analysed only when you press “Suggest”.
        </span>
      ) : (
        <span>
          <strong className="text-ink">AI assist not configured.</strong> Suggestions use a rule-based keyword baseline, not AI.
        </span>
      )}
    </p>
  );
}

function ShareCheckbox({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-brand)]" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <span className="font-medium text-ink">Share anonymously with the community</span>
        <span className="block text-xs text-muted">Others see the category, description, time and an area rounded to ~1 km — never your name.</span>
      </span>
    </label>
  );
}

function EditReportForm({
  report,
  onSave,
  onCancel,
}: {
  report: IncidentReport;
  onSave: (patch: ReportPatch) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<IncidentCategory>(report.category);
  const [description, setDescription] = useState(report.description);
  const [shared, setShared] = useState(report.shared);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = description.trim();
    if (trimmed.length < MIN_DESCRIPTION) {
      setError(`Describe the incident in at least ${MIN_DESCRIPTION} characters.`);
      return;
    }
    setBusy(true);
    const result = await onSave({ category, description: trimmed, shared });
    setBusy(false);
    if (result) setError(result);
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="edit-category" className="field-label">
          Category
        </label>
        <select id="edit-category" className="field" value={category} onChange={(event) => setCategory(event.target.value as IncidentCategory)}>
          {INCIDENT_CATEGORIES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="edit-description" className="field-label">
          Description
        </label>
        <textarea
          id="edit-description"
          rows={4}
          maxLength={MAX_DESCRIPTION}
          className="field resize-y leading-relaxed"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <ShareCheckbox checked={shared} onChange={setShared} />
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} Save changes
        </button>
      </div>
    </form>
  );
}

function ReportForm({
  geo,
  engine,
  onSave,
  onDone,
  onCancel,
}: {
  geo: Geolocation;
  engine: EngineInfo;
  onSave: (report: NewReport) => Promise<string | null>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IncidentCategory | "">("");
  const [attachLocation, setAttachLocation] = useState(false);
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [shared, setShared] = useState(false);
  const [assist, setAssist] = useState<TriageResult | null>(null);
  const [assistState, setAssistState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<{ description?: string; category?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  const trimmed = description.trim();

  async function suggest() {
    if (trimmed.length < MIN_DESCRIPTION) {
      setErrors({ description: `Write at least ${MIN_DESCRIPTION} characters first.` });
      return;
    }
    setErrors({});
    setAssistState("loading");
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(String(response.status));
      setAssist((await response.json()) as TriageResult);
    } catch {
      // Never block the user: fall back to the in-browser baseline.
      setAssist({ ...ruleBasedTriage(trimmed), fallbackReason: "The server couldn’t be reached, so the rule-based baseline ran in your browser." });
    }
    setAssistState("done");
  }

  async function toggleLocation(checked: boolean) {
    setAttachLocation(checked);
    if (!checked) {
      setLocation(null);
      return;
    }
    if (geo.position) {
      setLocation(geo.position);
      return;
    }
    setLocating(true);
    const point = await geo.locateOnce();
    setLocating(false);
    if (point) setLocation(point);
    else setAttachLocation(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: typeof errors = {};
    if (trimmed.length < MIN_DESCRIPTION) next.description = `Describe the incident in at least ${MIN_DESCRIPTION} characters.`;
    if (!category) next.category = "Choose a category (or apply the suggestion).";
    setErrors(next);
    if (Object.keys(next).length || !category) return;
    setSaving(true);
    const error = await onSave({
      category,
      description: trimmed,
      location: attachLocation && location ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy } : null,
      assist: assist
        ? {
            engine: assist.engine,
            suggestedCategory: assist.suggestedCategory,
            confidence: assist.confidence,
            summary: assist.summary.slice(0, 600),
            accepted: assist.suggestedCategory === category,
          }
        : null,
      shared,
    });
    setSaving(false);
    if (error) setErrors({ form: error });
    else onDone();
  }

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="space-y-5">
      {errors.form && (
        <p role="alert" className="rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm text-danger">
          {errors.form}
        </p>
      )}
      <div>
        <label htmlFor="report-description" className="field-label">
          What happened?
        </label>
        <textarea
          id="report-description"
          rows={4}
          maxLength={MAX_DESCRIPTION}
          className="field resize-y leading-relaxed"
          placeholder="e.g. Water is rising fast near the market road by the bus stand. Two scooters are stuck."
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            if (assist) setAssistState("idle");
          }}
          aria-invalid={Boolean(errors.description)}
          aria-describedby="report-description-help"
        />
        <div id="report-description-help" className="mt-1.5 flex justify-between gap-2 text-xs">
          <span className={errors.description ? "font-medium text-danger" : "text-muted"}>
            {errors.description ?? "Describe places and events. Don’t name people or describe them by religion, caste or appearance."}
          </span>
          <span className="shrink-0 text-muted tabular-nums">
            {description.length}/{MAX_DESCRIPTION}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles size={16} className="text-brand" aria-hidden />
            Incident assistant <span className="font-normal text-muted">(optional)</span>
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void suggest()} disabled={assistState === "loading"}>
            {assistState === "loading" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Wand2 size={14} aria-hidden />}
            {assistState === "loading" ? "Analysing…" : assist ? "Re-analyse" : "Suggest category"}
          </button>
        </div>
        {!assist && (
          <p className="mt-2 text-xs text-muted">
            {engine?.aiConfigured
              ? "Sends only this description (no name, email or location) to Claude via our server."
              : "Uses a rule-based keyword baseline — no AI is configured on this server."}
          </p>
        )}
        {assist && (
          <AssistResult result={assist} stale={assistState === "idle"} applied={category === assist.suggestedCategory} onApply={(value) => setCategory(value)} />
        )}
      </div>

      <div>
        <label htmlFor="report-category" className="field-label">
          Category
        </label>
        <select
          id="report-category"
          className="field"
          value={category}
          onChange={(event) => setCategory(event.target.value as IncidentCategory)}
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "report-category-error" : undefined}
        >
          <option value="">Select a category…</option>
          {INCIDENT_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="report-category-error" className="field-error">
            {errors.category}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-[var(--color-brand)]"
            checked={attachLocation}
            onChange={(event) => void toggleLocation(event.target.checked)}
            disabled={locating}
          />
          <span>
            <span className="font-medium text-ink">Attach my current location</span>
            <span className="block text-xs text-muted">
              {locating
                ? "Getting your location…"
                : location && attachLocation
                  ? `${formatCoords(location)}${location.accuracy ? ` (±${location.accuracy} m)` : ""}`
                  : geo.error && !location
                    ? geo.error
                    : "Optional. Asks your browser for permission."}
            </span>
          </span>
        </label>
        <ShareCheckbox checked={shared} onChange={setShared} />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <Loader2 size={16} className="animate-spin" aria-hidden />} Save report
        </button>
      </div>
    </form>
  );
}

function AssistResult({
  result,
  stale,
  applied,
  onApply,
}: {
  result: TriageResult;
  stale: boolean;
  applied: boolean;
  onApply: (category: IncidentCategory) => void;
}) {
  const confidenceStyle = {
    high: "bg-safe-50 text-safe",
    medium: "bg-brand-50 text-brand",
    low: "bg-warn-50 text-warn",
  }[result.confidence];

  return (
    <div className="mt-3 space-y-3" aria-live="polite">
      {result.urgentCues.length > 0 && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm sm:flex-row sm:items-center">
          <AlertTriangle size={18} className="shrink-0 text-danger" aria-hidden />
          <p className="flex-1 text-ink">
            Your description mentions {result.urgentCues.slice(0, 3).map((cue) => `“${cue}”`).join(", ")}. If this is happening now, call 112
            first — you can finish the report later.
          </p>
          <a href="tel:112" className="btn btn-danger btn-sm shrink-0">
            <Phone size={14} aria-hidden /> Call 112
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="chip bg-white text-ink">
          {result.engine === "claude" ? (
            <>
              <Bot size={12} aria-hidden /> Claude AI{result.model ? ` · ${result.model}` : ""}
            </>
          ) : (
            <>Rule-based baseline · not AI</>
          )}
        </span>
        <span className={`chip ${confidenceStyle}`}>Confidence: {result.confidence}</span>
        {stale && <span className="chip bg-warn-50 text-warn">Text changed — re-analyse to update</span>}
      </div>
      {result.fallbackReason && <p className="text-xs text-muted">{result.fallbackReason}</p>}

      <div className="rounded-xl border border-line bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">
            Suggested category: <strong className="text-ink">{result.suggestedCategory}</strong>
          </p>
          <button type="button" className={`btn btn-sm ${applied ? "btn-safe" : "btn-primary"}`} onClick={() => onApply(result.suggestedCategory)}>
            {applied ? <Check size={14} aria-hidden /> : null}
            {applied ? "Applied" : "Use this category"}
          </button>
        </div>
        {result.alternatives.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            Also possible:
            {result.alternatives.map((alt) => (
              <button key={alt} type="button" className="chip border border-line bg-white text-ink hover:border-brand" onClick={() => onApply(alt)}>
                {alt}
              </button>
            ))}
          </p>
        )}
        <p className="mt-2 text-xs text-body">
          <span className="font-semibold text-ink">Why: </span>
          {result.rationale}
        </p>
      </div>

      <dl className="grid gap-2 rounded-xl border border-line bg-white p-3 text-xs sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="font-semibold text-ink">Summary</dt>
          <dd className="mt-0.5 text-body">{result.summary}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Where</dt>
          <dd className="mt-0.5 text-body">{result.fields.where ?? <span className="text-muted">Not stated</span>}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">When</dt>
          <dd className="mt-0.5 text-body">{result.fields.when ?? <span className="text-muted">Not stated</span>}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">People involved</dt>
          <dd className="mt-0.5 text-body">{result.fields.peopleAffected ?? <span className="text-muted">Not stated</span>}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Hazards mentioned</dt>
          <dd className="mt-0.5 text-body">
            {result.fields.hazardsMentioned.length ? result.fields.hazardsMentioned.join(", ") : <span className="text-muted">None found</span>}
          </dd>
        </div>
      </dl>

      <p className="flex gap-2 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold text-body">Uncertainty: </span>
          {result.uncertainty} Suggestions can be wrong — review before saving.
        </span>
      </p>
    </div>
  );
}
