"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, RefreshCw, TriangleAlert, UsersRound } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import type { CommunityReport } from "@/lib/types";

/** Anonymised, opt-in reports from all users over the last 7 days. Always labelled unverified. */
export function CommunityPanel({ version }: { version: number }) {
  const [reports, setReports] = useState<CommunityReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await api<{ reports: CommunityReport[] }>("/api/community");
    if (result.ok) {
      setReports(result.data.reports);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Async fetch; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, version]);

  return (
    <section id="community" aria-labelledby="community-title" className="card scroll-mt-32 lg:col-span-2 lg:scroll-mt-20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Community</p>
          <h2 id="community-title" className="mt-1 text-lg font-bold">
            Shared reports · last 7 days
          </h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void load()} disabled={loading} aria-label="Refresh community reports">
          {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <RefreshCw size={16} aria-hidden />}
        </button>
      </div>

      <p className="mt-3 flex gap-2 rounded-xl border border-warn-100 bg-warn-50 px-3 py-2 text-xs text-ink-soft">
        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden />
        User-submitted and unverified. Not official alerts — follow 112 and local authorities.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {reports === null && loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted" role="status">
          <Loader2 size={14} className="animate-spin" aria-hidden /> Loading…
        </p>
      ) : reports && reports.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-line-strong p-6 text-center">
          <UsersRound size={24} className="text-brand" aria-hidden />
          <p className="mt-2 text-sm font-medium text-ink">Nothing shared yet</p>
          <p className="mt-1 text-xs text-muted">Tick “Share anonymously” on a report to add it here.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {reports?.map((report) => (
            <li key={report.id} className="py-3 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-brand-50 text-brand">{report.category}</span>
                <span className="chip border border-warn-100 bg-warn-50 text-warn">Unverified</span>
                {report.mine && <span className="chip bg-surface-2 text-body">Yours</span>}
                <span className="ml-auto text-xs text-muted">{formatDateTime(report.createdAt)}</span>
              </div>
              <p className="mt-1.5 line-clamp-3 text-sm break-words whitespace-pre-line text-ink">{report.description}</p>
              {report.area && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${report.area.lat}&mlon=${report.area.lng}#map=14/${report.area.lat}/${report.area.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  <MapPin size={12} aria-hidden /> Approximate area (~1 km)
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
