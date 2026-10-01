"use client";

import { useState, useEffect } from "react";
import {
  Waves, AlertTriangle, Phone, MapPin, Users, Wind,
  ChevronDown, ChevronUp, Shield, RefreshCw, Anchor,
  ThumbsUp, ThumbsDown, Info, ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface BeachStatus {
  id: string;
  name: string;
  lat: number;
  lng: number;
  taluka: string;
  flag: 'green' | 'yellow' | 'red';
  waveHeightM: number;
  swimmable: boolean;
  lifeguards: boolean;
  ripCurrentRisk: 'low' | 'medium' | 'high';
  description: string;
  nearestPolice: string;
  nearestHospital: string;
  knownHazards: string[];
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

interface MarineData {
  waveHeightM: number;
  seaCondition: string;
  swimmingAdvisory: string;
}

const FLAG_CONFIG = {
  green: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500',
    label: '🟢 Safe',
    icon: ThumbsUp
  },
  yellow: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    badge: 'bg-amber-500',
    label: '🟡 Caution',
    icon: AlertTriangle
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    badge: 'bg-red-500',
    label: '🔴 Danger',
    icon: ThumbsDown
  }
};

const RIP_RISK_COLORS = {
  low: 'text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  high: 'text-red-400 bg-red-500/10'
};

function BeachCard({ beach, expanded, onToggle }: {
  beach: BeachStatus;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = FLAG_CONFIG[beach.flag];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-300`}
    >
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 hover:opacity-90 transition-opacity text-left"
      >
        {/* Flag indicator */}
        <div className={`w-3 h-12 rounded-full ${config.badge} shrink-0`} />

        {/* Beach info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-white text-sm truncate">{beach.name}</h3>
            {beach.lifeguards && (
              <span className="shrink-0 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-1.5 py-0.5 font-medium flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" /> Lifeguards
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{beach.taluka}</p>
        </div>

        {/* Status + wave */}
        <div className="text-right shrink-0">
          <div className={`text-xs font-bold ${config.text} mb-1`}>
            {config.label}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">
            <Waves className="w-3 h-3" />
            {beach.waveHeightM.toFixed(1)}m
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">{beach.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
              <div className="text-xs text-slate-500 mb-0.5">Wave Ht</div>
              <div className="font-bold text-white text-sm">{beach.waveHeightM.toFixed(1)}m</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
              <div className="text-xs text-slate-500 mb-0.5">Rip Risk</div>
              <div className={`font-bold text-sm capitalize ${RIP_RISK_COLORS[beach.ripCurrentRisk]}`}>
                {beach.ripCurrentRisk}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
              <div className="text-xs text-slate-500 mb-0.5">Swim</div>
              <div className={`font-bold text-sm ${beach.swimmable ? 'text-emerald-400' : 'text-red-400'}`}>
                {beach.swimmable ? 'OK' : 'No'}
              </div>
            </div>
          </div>

          {/* Hazards */}
          {beach.knownHazards.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Known Hazards</p>
              <div className="flex flex-wrap gap-1.5">
                {beach.knownHazards.map((h, i) => (
                  <span key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 rounded-full px-2 py-0.5">
                    ⚠ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emergency contacts */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Emergency Contacts</p>
            <a href={`tel:${beach.nearestPolice.split('—')[1]?.trim()}`}
              className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-blue-400" />
              {beach.nearestPolice}
            </a>
            <a href={`tel:108`}
              className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-red-400" />
              {beach.nearestHospital}
            </a>
          </div>

          {/* Map link */}
          <a
            href={`https://www.google.com/maps?q=${beach.lat},${beach.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default function BeachPage() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [marine, setMarine] = useState<MarineData | null>(null);
  const [beaches, setBeaches] = useState<BeachStatus[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterFlag, setFilterFlag] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beach-status');
      const data = await res.json();
      setWeather(data.weather);
      setMarine(data.marine);
      setBeaches(data.beaches);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // fallback handled in API
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredBeaches = beaches.filter(b => filterFlag === 'all' || b.flag === filterFlag);
  const counts = { green: beaches.filter(b => b.flag === 'green').length, yellow: beaches.filter(b => b.flag === 'yellow').length, red: beaches.filter(b => b.flag === 'red').length };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">Beach Safety</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full px-2 py-0.5">Live</span>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {lastUpdated ? `Updated ${lastUpdated}` : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Drishti Lifeguard Alert */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
          <Anchor className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-300 text-sm">Drishti Marine Lifeguards — Goa</p>
            <p className="text-xs text-slate-400 mt-0.5">Active at select beaches. Emergency: <a href="tel:+918322464333" className="text-blue-400 font-bold hover:underline">+91-832-2464333</a></p>
          </div>
        </div>

        {/* Weather + Marine overview */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{weather?.temperature}°C</div>
              <div className="text-xs text-slate-400 mt-1">Temperature</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{marine?.waveHeightM?.toFixed(1)}m</div>
              <div className="text-xs text-slate-400 mt-1">Wave Height</div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
              <Wind className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{weather?.windSpeed} km/h</div>
              <div className="text-xs text-slate-400">Wind</div>
            </div>
            <div className={`border rounded-2xl p-4 text-center ${marine?.seaCondition === 'calm' ? 'bg-emerald-500/20 border-emerald-500/30' : marine?.seaCondition === 'rough' || marine?.seaCondition === 'very_rough' ? 'bg-red-500/20 border-red-500/30' : 'bg-amber-500/20 border-amber-500/30'}`}>
              <div className={`text-lg font-bold capitalize ${marine?.seaCondition === 'calm' ? 'text-emerald-300' : marine?.seaCondition === 'rough' || marine?.seaCondition === 'very_rough' ? 'text-red-300' : 'text-amber-300'}`}>
                {marine?.seaCondition?.replace('_', ' ')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Sea Condition</div>
            </div>
          </div>
        )}

        {/* Swimming advisory */}
        {marine && (
          <div className={`rounded-2xl p-4 border flex items-start gap-3 ${marine.seaCondition === 'calm' ? 'bg-emerald-500/10 border-emerald-500/30' : marine.seaCondition === 'rough' || marine.seaCondition === 'very_rough' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-slate-200">{marine.swimmingAdvisory}</p>
          </div>
        )}

        {/* Filter tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">All Goa Beaches ({beaches.length})</h2>
            <div className="flex gap-2 text-xs">
              {(['all', 'green', 'yellow', 'red'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterFlag(f)}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${filterFlag === f ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                  {f === 'all' ? `All (${beaches.length})` : f === 'green' ? `✅ ${counts.green}` : f === 'yellow' ? `⚠️ ${counts.yellow}` : `🚫 ${counts.red}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800/40 rounded-2xl animate-pulse" />
              ))
            ) : (
              filteredBeaches.map(beach => (
                <BeachCard
                  key={beach.id}
                  beach={beach}
                  expanded={expandedId === beach.id}
                  onToggle={() => setExpandedId(expandedId === beach.id ? null : beach.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Beach Flag Legend</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2"><div className="w-2 h-8 rounded-full bg-emerald-500" /><div><div className="font-bold text-emerald-400">Green</div><div className="text-slate-500">Relatively safe</div></div></div>
            <div className="flex items-center gap-2"><div className="w-2 h-8 rounded-full bg-amber-500" /><div><div className="font-bold text-amber-400">Yellow</div><div className="text-slate-500">Caution — currents</div></div></div>
            <div className="flex items-center gap-2"><div className="w-2 h-8 rounded-full bg-red-500" /><div><div className="font-bold text-red-400">Red</div><div className="text-slate-500">Do not enter water</div></div></div>
          </div>
        </div>

        {/* Source */}
        <p className="text-center text-[10px] text-slate-600">
          Wave data: open-meteo.com marine API • Beach hazard info: Goa Coastal Zone Management Authority • Drishti Marine Lifeguards
        </p>
      </div>
    </div>
  );
}
