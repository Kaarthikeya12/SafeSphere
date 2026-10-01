"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Copy,
  Cross,
  ExternalLink,
  Flame,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Pill,
  Share2,
  Shield,
  Square,
} from "lucide-react";
import { copyText, distanceKm, formatCoords, formatTime, mapsLink, osmLink } from "@/lib/format";
import type { Geolocation } from "@/lib/use-geolocation";
import { type Facility, DEFAULT_GOA_LOCATION, VERIFIED_GOA_FACILITIES } from "./safety-map";
import type { ToastMessage } from "./toast";
import type { GeoPoint } from "@/lib/types";

const SafetyMap = dynamic(() => import("./safety-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-muted">
      <Loader2 className="animate-spin text-brand" aria-hidden />
    </div>
  ),
});

const HELP_TYPES = [
  { id: "hospital", label: "Hospitals", icon: Cross, filter: '["amenity"~"^(hospital|clinic)$"]', search: "hospital" },
  { id: "police", label: "Police", icon: Shield, filter: '["amenity"="police"]', search: "police station" },
  { id: "fire", label: "Fire stations", icon: Flame, filter: '["amenity"="fire_station"]', search: "fire station" },
  { id: "pharmacy", label: "Pharmacies", icon: Pill, filter: '["amenity"="pharmacy"]', search: "pharmacy" },
] as const;

type HelpType = (typeof HELP_TYPES)[number];
type OverpassElement = { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const RADIUS_M = 5000;
const SEARCH_LINKS = ["Hospital", "Police station", "Fire station", "Pharmacy", "Relief shelter"];

export const GOA_PRESETS = [
  { name: "GEC Farmagudi Campus", lat: 15.4227, lng: 74.0089 },
  { name: "Ponda Market & Bus Stand", lat: 15.4026, lng: 74.0152 },
  { name: "Panjim Miramar Promenade", lat: 15.4862, lng: 73.8078 },
  { name: "Calangute Beach Belt", lat: 15.5439, lng: 73.7553 },
  { name: "GMC Bambolim Hospital", lat: 15.4619, lng: 73.8560 },
  { name: "Margao Railway Station", lat: 15.2736, lng: 73.9582 },
];

export function LocationPanel({ geo, notify }: { geo: Geolocation; notify: (message: string, tone?: ToastMessage["tone"]) => void }) {
  const [helpType, setHelpType] = useState<HelpType | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [helpState, setHelpState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [helpError, setHelpError] = useState<string | null>(null);
  const [customPosition, setCustomPosition] = useState<GeoPoint | null>(null);
  const { position } = geo;
  const activePosition: GeoPoint = position ?? customPosition ?? DEFAULT_GOA_LOCATION;

  async function findHelp(type: HelpType) {
    setHelpType(type);
    setHelpState("loading");
    setHelpError(null);
    const origin = activePosition;
    if (!origin) {
      setHelpState("error");
      setHelpError("Your location is needed to search nearby. Use the search links below instead.");
      return;
    }
    // Round to ~100 m before sending to the public Overpass API, to limit what is disclosed.
    const lat = Number(origin.lat.toFixed(3));
    const lng = Number(origin.lng.toFixed(3));
    const query = `[out:json][timeout:20];nwr${type.filter}(around:${RADIUS_M},${lat},${lng});out center tags 40;`;
    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
      const data = (await response.json()) as { elements: OverpassElement[] };
      const results = data.elements
        .map((element): Facility | null => {
          const pLat = element.lat ?? element.center?.lat;
          const pLng = element.lon ?? element.center?.lon;
          if (pLat === undefined || pLng === undefined) return null;
          const tags = element.tags ?? {};
          return {
            id: `${element.type}-${element.id}`,
            name: tags.name || tags["name:en"] || `Unnamed ${type.label.toLowerCase().replace(/s$/, "")}`,
            kind: tags.amenity ?? type.id,
            lat: pLat,
            lng: pLng,
            phone: tags.phone || tags["contact:phone"] || tags.emergency_phone,
            distanceKm: distanceKm(origin, { lat: pLat, lng: pLng }),
          };
        })
        .filter((facility): facility is Facility => facility !== null)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 8);
      setFacilities(results);
      setHelpState("done");
    } catch {
      setFacilities([]);
      setHelpState("error");
      setHelpError("Couldn’t reach OpenStreetMap’s Overpass service. Use the search links below instead.");
    }
  }

  const statusText =
    geo.status === "watching"
      ? "Live location on"
      : geo.status === "locating"
        ? "Getting your location…"
        : position
          ? "Last known location (not updating)"
          : "Location off";

  return (
    <section id="location" aria-labelledby="location-title" className="card scroll-mt-32 lg:col-span-2 lg:scroll-mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="kicker">Location &amp; nearby help</p>
          <h2 id="location-title" className="mt-1 text-lg font-bold">
            Where you are
          </h2>
          <p className="mt-1 flex items-center gap-2 text-sm" aria-live="polite">
            <span className={`size-2.5 rounded-full ${geo.watching ? "bg-safe" : position ? "bg-warn" : "bg-line-strong"}`} aria-hidden />
            {statusText}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {geo.watching ? (
            <button type="button" className="btn btn-secondary btn-sm" onClick={geo.stopWatching}>
              <Square size={14} aria-hidden /> Stop sharing
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={geo.startWatching} disabled={geo.status === "locating"}>
              {geo.status === "locating" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Navigation size={14} aria-hidden />}
              Start live location
            </button>
          )}
          {position && !geo.watching && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={geo.clear}>
              Clear
            </button>
          )}
        </div>
      </div>

      {geo.error && (
        <div role="alert" className="mt-3 flex gap-2 rounded-xl border border-warn-100 bg-warn-50 p-3 text-sm text-ink-soft">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span>{geo.error}</span>
        </div>
      )}
      {geo.permission === "denied" && !geo.error && (
        <p className="mt-3 text-sm text-warn">Location is blocked for this site. Enable it in your browser’s site settings to use live location.</p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-2">
          <div className="h-72 overflow-hidden rounded-xl border border-line bg-surface md:h-80 shadow-sm">
            <SafetyMap
              position={activePosition}
              facilities={facilities}
              onPositionChange={(pos) => {
                setCustomPosition(pos);
                notify(`Map pinned to ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`, "info");
              }}
            />
          </div>
          {/* Quick Goa Sector Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted">Goa Hotspots:</span>
            {GOA_PRESETS.map((spot) => (
              <button
                key={spot.name}
                type="button"
                onClick={() => {
                  setCustomPosition({
                    lat: spot.lat,
                    lng: spot.lng,
                    accuracy: 10,
                    timestamp: Date.now(),
                  });
                  notify(`Map centered on ${spot.name}`, "info");
                }}
                className={`chip border text-[11px] py-1 transition-colors ${
                  activePosition.lat === spot.lat && activePosition.lng === spot.lng
                    ? "border-brand bg-brand-50 text-brand"
                    : "border-line bg-white hover:border-brand text-ink"
                }`}
              >
                {spot.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-line p-3 bg-white">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Active Pin Coordinates</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand">
                {position ? "Live GPS" : customPosition ? "Manual Pin" : "GEC Default"}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-ink">{formatCoords(activePosition)}</p>
            <p className="text-xs text-muted">
              {activePosition.accuracy ? `±${activePosition.accuracy} m · ` : ""}
              {position ? `updated ${formatTime(activePosition.timestamp)}` : "Click anywhere on map to reposition"}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={async () => notify((await copyText(mapsLink(activePosition))) ? "Location link copied." : "Couldn’t copy the link.", "info")}
              >
                <Copy size={14} aria-hidden /> Copy link
              </button>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigator.share({ title: "My location", url: mapsLink(activePosition) }).catch(() => undefined)}
                >
                  <Share2 size={14} aria-hidden /> Share
                </button>
              )}
              <a className="btn btn-ghost btn-sm" href={osmLink(activePosition)} target="_blank" rel="noreferrer">
                OSM <ExternalLink size={12} aria-hidden />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Find help within 5 km</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {HELP_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => void findHelp(type)}
                  aria-pressed={helpType?.id === type.id}
                  className={`btn btn-sm justify-start border ${
                    helpType?.id === type.id ? "border-brand bg-brand-50 text-brand" : "border-line-strong bg-white text-ink hover:bg-surface"
                  }`}
                >
                  <type.icon size={14} aria-hidden /> {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {helpType && (
        <div className="mt-4 rounded-xl border border-line p-3" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Building2 size={16} className="text-brand" aria-hidden /> {helpType.label} near you
            </p>
            <a
              className="text-xs font-semibold text-brand hover:underline"
              href={
                position
                  ? `https://www.google.com/maps/search/${encodeURIComponent(helpType.search)}/@${position.lat.toFixed(5)},${position.lng.toFixed(5)},15z`
                  : `https://www.google.com/maps/search/${encodeURIComponent(`${helpType.search} near me`)}`
              }
              target="_blank"
              rel="noreferrer"
            >
              Search on Google Maps ↗
            </a>
          </div>
          {helpState === "loading" && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" aria-hidden /> Searching OpenStreetMap…
            </p>
          )}
          {helpState === "error" && <p className="mt-3 text-sm text-warn">{helpError}</p>}
          {helpState === "done" && facilities.length === 0 && (
            <p className="mt-3 text-sm text-muted">No {helpType.label.toLowerCase()} are mapped in OpenStreetMap within 5 km. Try the search link.</p>
          )}
          {helpState === "done" && facilities.length > 0 && (
            <ul className="mt-2 divide-y divide-line">
              {facilities.map((facility) => (
                <li key={facility.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{facility.name}</p>
                    <p className="text-xs text-muted">{facility.distanceKm.toFixed(1)} km straight-line</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {facility.phone && (
                      <a href={`tel:${facility.phone.split(";")[0].trim()}`} className="btn btn-ghost btn-sm px-2" aria-label={`Call ${facility.name}`}>
                        Call
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Directions
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted">
            Results come live from OpenStreetMap contributors and may be incomplete or out of date. Searching sends your approximate
            location (rounded to ~100 m) to the public Overpass API.
          </p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Search on Google Maps</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SEARCH_LINKS.map((query) => (
            <a
              key={query}
              href={
                position
                  ? `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${position.lat.toFixed(4)},${position.lng.toFixed(4)},14z`
                  : `https://www.google.com/maps/search/${encodeURIComponent(`${query} near me`)}`
              }
              target="_blank"
              rel="noreferrer"
              className="chip border border-line bg-white py-1 text-ink hover:border-brand"
            >
              {query} <ExternalLink size={11} aria-hidden />
            </a>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Location is read only while you use these tools and is never saved on our server. Press “Stop sharing” any time.
      </p>
    </section>
  );
}
