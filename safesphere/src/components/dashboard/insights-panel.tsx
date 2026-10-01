"use client";

import { BarChart3, Bot } from "lucide-react";
import type { IncidentReport } from "@/lib/types";

/**
 * Summaries computed only from the signed-in user's own saved reports.
 * No sample data, scores or community-wide statistics are invented.
 */
export function InsightsPanel({ reports }: { reports: IncidentReport[] }) {
  const counts = new Map<string, number>();
  for (const report of reports) counts.set(report.category, (counts.get(report.category) ?? 0) + 1);
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = rows[0]?.[1] ?? 0;

  const assisted = reports.filter((report) => report.assist);
  const aiAssisted = assisted.filter((report) => report.assist?.engine === "claude").length;
  const accepted = assisted.filter((report) => report.assist?.accepted).length;

  return (
    <section aria-labelledby="insights-title" className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Insights</p>
          <h2 id="insights-title" className="mt-1 text-lg font-bold">
            Your reports at a glance
          </h2>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
          <BarChart3 size={20} aria-hidden />
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line-strong p-5 text-center text-sm text-muted">
          Insights appear once you save a report.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-2.5" aria-label="Reports by category">
            {rows.map(([category, count]) => (
              <li key={category}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate text-ink">{category}</span>
                  <span className="font-semibold text-ink tabular-nums">{count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface-2" aria-hidden>
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(6, (count / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-5 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-surface p-3">
              <dt className="text-xs text-muted">Used the assistant</dt>
              <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">
                {assisted.length}
                <span className="text-sm font-medium text-muted">/{reports.length}</span>
              </dd>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <dt className="text-xs text-muted">Suggestion kept</dt>
              <dd className="mt-0.5 text-lg font-bold text-ink tabular-nums">
                {assisted.length ? `${accepted}/${assisted.length}` : "—"}
              </dd>
            </div>
          </dl>
          {assisted.length > 0 && (
            <p className="mt-3 flex gap-2 text-xs text-muted">
              <Bot size={14} className="mt-0.5 shrink-0" aria-hidden />
              {aiAssisted} by Claude AI, {assisted.length - aiAssisted} by the rule-based baseline. Corrections show where suggestions miss.
            </p>
          )}
        </>
      )}
    </section>
  );
}
