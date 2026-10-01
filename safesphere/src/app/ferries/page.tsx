"use client";

import { useState } from "react";
import {
  Anchor, Phone, Clock, MapPin, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, ArrowLeft, Navigation, Info
} from "lucide-react";
import Link from "next/link";
import { GOA_FERRIES } from "@/data/goaFerries";

// Simulate live ferry status based on time of day
function getLiveFerryStatus(ferry: (typeof GOA_FERRIES)[0]) {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); // 0-indexed

  // Jun-Sep (months 5-8) = monsoon
  const isMonsoon = month >= 5 && month <= 8;

  if (ferry.suspended_monsoon && isMonsoon) {
    return { status: 'suspended' as const, reason: 'Suspended — Monsoon season (Jun–Sep). River levels unsafe for ferry operation.', color: 'red' };
  }

  const [openH, openM] = ferry.operatingHours.split('–')[0].trim().split(':').map(Number);
  const [closeH] = ferry.operatingHours.split('–')[1].trim().split(':').map(Number);

  const totalOpenMin = openH * 60 + (openM || 0);
  const totalCloseMin = closeH * 60;
  const currentMin = hour * 60 + now.getMinutes();

  if (currentMin < totalOpenMin || currentMin > totalCloseMin) {
    return { status: 'closed' as const, reason: `Operating hours: ${ferry.operatingHours}`, color: 'amber' };
  }

  // Simulate occasional delay
  const seed = (ferry.id.charCodeAt(0) + hour) % 10;
  if (seed < 2) {
    return { status: 'delayed' as const, reason: 'Running ~15 min behind schedule. High passenger load.', color: 'amber' };
  }

  return { status: 'running' as const, reason: 'On schedule — operating normally', color: 'green' };
}

const STATUS_CONFIG = {
  running: { label: '✅ Running', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  delayed: { label: '⏱ Delayed', bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400' },
  suspended: { label: '🚫 Suspended', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400' },
  closed: { label: '🌙 Closed', bg: 'bg-slate-700/40', border: 'border-slate-600/30', text: 'text-slate-400', dot: 'bg-slate-500' }
};

function FerryCard({ ferry }: { ferry: (typeof GOA_FERRIES)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const live = getLiveFerryStatus(ferry);
  const config = STATUS_CONFIG[live.status];

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-start gap-3 text-left hover:opacity-90 transition-opacity"
      >
        {/* Status dot */}
        <div className="pt-1">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot} block ${live.status === 'running' ? 'animate-pulse' : ''}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-sm leading-tight">{ferry.name}</h3>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${config.text}`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{ferry.river} · {ferry.fromBank} ↔ {ferry.toBank}</p>
          <p className="text-xs text-slate-500 mt-0.5 italic">{live.reason}</p>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
          {/* Grid details */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Frequency</p>
              <p className="text-sm font-semibold text-white">{ferry.frequency}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Hours</p>
              <p className="text-sm font-semibold text-white">{ferry.operatingHours}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Fare</p>
              <p className="text-xs font-semibold text-white">{ferry.fare}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Car Ferry</p>
              <p className="text-sm font-semibold text-white">{ferry.carFerry ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-900/40 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">{ferry.notes}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={`tel:${ferry.contact}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-blue-500/30 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call GSWTD
            </a>
            <a
              href={`https://www.google.com/maps?q=${ferry.fromLat},${ferry.fromLng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800/60 border border-slate-700/50 text-slate-300 rounded-xl py-2.5 text-xs font-semibold hover:bg-slate-700/50 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FerriesPage() {
  const running = GOA_FERRIES.filter(f => getLiveFerryStatus(f).status === 'running').length;
  const total = GOA_FERRIES.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">Ferry Status</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-2 py-0.5">Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Overview stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{running}</div>
            <div className="text-xs text-slate-400 mt-1">Operating</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-slate-400 mt-1">Total Ferries</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs text-slate-400 mt-1">Local Time</div>
          </div>
        </div>

        {/* Monsoon alert */}
        {(() => {
          const month = new Date().getMonth();
          return (month >= 5 && month <= 8) ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 text-sm">Monsoon Season Advisory</p>
                <p className="text-xs text-slate-400 mt-1">
                  Small ferries (Aldona-Corjuem, Cavelossim-Assolna) are suspended Jun–Sep due to high river levels.
                  Always call GSWTD before travelling: <a href="tel:08322224888" className="text-blue-400 font-bold">0832-2224888</a>
                </p>
              </div>
            </div>
          ) : null;
        })()}

        {/* Ferry cards */}
        <div className="space-y-3">
          {GOA_FERRIES.map(ferry => (
            <FerryCard key={ferry.id} ferry={ferry} />
          ))}
        </div>

        {/* GSWTD contact */}
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Goa State Water Transport Dept.</p>
          <a
            href="tel:08322224888"
            className="flex items-center gap-3 text-sm text-white hover:text-blue-300 transition-colors"
          >
            <Phone className="w-4 h-4 text-blue-400" />
            0832-2224888 (GSWTD Control)
          </a>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            Helpline available 6 AM – 10 PM daily
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600">
          Status is based on time-of-day and seasonal rules. Always verify with GSWTD before travelling. Operator: Goa State Water Transport Department.
        </p>
      </div>
    </div>
  );
}
