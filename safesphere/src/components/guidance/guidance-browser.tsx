"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Ban, CheckCircle2, ClipboardList, Info, Phone } from "lucide-react";
import { GUIDANCE, OFFICIAL_REMINDER } from "@/lib/guidance";

/** Accessible tabbed guidance (WAI-ARIA tabs pattern with arrow-key navigation). */
export function GuidanceBrowser({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState(GUIDANCE[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = useId();
  const active = GUIDANCE.find((topic) => topic.id === activeId) ?? GUIDANCE[0];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = GUIDANCE.findIndex((topic) => topic.id === activeId);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % GUIDANCE.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + GUIDANCE.length) % GUIDANCE.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = GUIDANCE.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextId = GUIDANCE[nextIndex].id;
    setActiveId(nextId);
    tabRefs.current[nextId]?.focus();
  }

  return (
    <div className={compact ? "" : "grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"}>
      <div
        role="tablist"
        aria-label="Emergency topics"
        aria-orientation={compact ? "horizontal" : "vertical"}
        onKeyDown={onKeyDown}
        className={
          compact
            ? "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
            : "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        }
      >
        {GUIDANCE.map(({ id, title, icon: Icon }) => {
          const selected = id === activeId;
          return (
            <button
              key={id}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              id={`${baseId}-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors ${
                selected ? "border-brand bg-brand-50 text-brand" : "border-line bg-white text-body hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon size={16} aria-hidden />
              {title}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        tabIndex={0}
        className={`rounded-2xl border border-line bg-white p-5 ${compact ? "mt-4" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {active.callFirst.map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number}`}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                line.number === "112" ? "border-danger-100 bg-danger-50 text-danger hover:bg-danger-100" : "border-line bg-white text-ink hover:border-brand"
              }`}
            >
              <Phone size={14} aria-hidden /> Call {line.number}
              <span className="font-normal text-muted">· {line.label}</span>
            </a>
          ))}
        </div>

        <div className={`mt-5 grid gap-5 ${compact ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
          <div className="md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 size={16} className="text-safe" aria-hidden /> Do now
            </h3>
            <ol className="mt-2 space-y-2 text-sm leading-relaxed">
              {active.doNow.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-ink-soft">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Ban size={16} className="text-danger" aria-hidden /> Avoid
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {active.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList size={16} className="text-brand" aria-hidden /> Prepare
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {active.prepare.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 flex gap-2 border-t border-line pt-4 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          {OFFICIAL_REMINDER}
        </p>
      </div>
    </div>
  );
}
