"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/types";
import { Sparkles, Camera, Navigation, Phone } from "lucide-react";

import {
  type Facility,
  DEFAULT_GOA_LOCATION,
  VERIFIED_GOA_FACILITIES,
} from "@/lib/map-data";
export { type Facility, DEFAULT_GOA_LOCATION, VERIFIED_GOA_FACILITIES };

// Danger road segments
const DANGER_ROADS_MAP = [
  { id: "nh4a-khandepar", name: "NH-4A Khandepar Ghats", risk: "extreme", points: [[15.4295, 74.0321], [15.4371, 74.1088], [15.5102, 74.1540]] as [number, number][] },
  { id: "calangute-anjuna", name: "Calangute–Anjuna Night Road", risk: "high", points: [[15.5569, 73.7520], [15.5640, 73.7450], [15.5741, 73.7407]] as [number, number][] },
  { id: "nh748-oldgoa", name: "NH-748 Old Goa–Ponda", risk: "high", points: [[15.4965, 73.9016], [15.4540, 73.9520], [15.4227, 74.0089]] as [number, number][] },
  { id: "sanguem-mollem", name: "Sanguem–Mollem Wildlife Road", risk: "extreme", points: [[15.3600, 74.3180], [15.3980, 74.3355], [15.4100, 74.3480]] as [number, number][] },
  { id: "dudhsagar-approach", name: "Dudhsagar Approach Road", risk: "extreme", points: [[15.3274, 74.2986], [15.3139, 74.3119]] as [number, number][] },
];

// Beach markers (top 10 for map performance)
const BEACH_MARKERS = [
  { id: "calangute", name: "Calangute Beach", lat: 15.5439, lng: 73.7553, flag: "red" },
  { id: "anjuna", name: "Anjuna Beach", lat: 15.5741, lng: 73.7407, flag: "red" },
  { id: "vagator", name: "Vagator Beach", lat: 15.5985, lng: 73.7371, flag: "red" },
  { id: "palolem", name: "Palolem Beach", lat: 15.0100, lng: 74.0232, flag: "green" },
  { id: "miramar", name: "Miramar Beach", lat: 15.4862, lng: 73.8078, flag: "yellow" },
  { id: "colva", name: "Colva Beach", lat: 15.2792, lng: 73.9227, flag: "yellow" },
  { id: "arambol", name: "Arambol Beach", lat: 15.6882, lng: 73.7048, flag: "yellow" },
  { id: "baga", name: "Baga Beach", lat: 15.5569, lng: 73.7520, flag: "yellow" },
];

// Ferry markers
const FERRY_MARKERS = [
  { id: "panaji-betim", name: "Panaji–Betim Ferry", lat: 15.4965, lng: 73.8290, running: true },
  { id: "querim-tiracol", name: "Querim–Tiracol Ferry", lat: 15.7089, lng: 73.7054, running: true },
  { id: "siolim-chopdem", name: "Siolim–Chopdem Ferry", lat: 15.6205, lng: 73.7542, running: true },
  { id: "agassaim-curca", name: "Agassaim–Curca Ferry", lat: 15.4339, lng: 73.9018, running: true },
  { id: "cavelossim-assolna", name: "Cavelossim–Assolna Ferry", lat: 15.1814, lng: 73.9481, running: false },
];

// Map controller
function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom, { duration: 1.0 }); }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick?.(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Icons
const createUserMarkerIcon = (isLive: boolean) => {
  const color = isLive ? "#2563eb" : "#059669";
  return L.divIcon({
    className: "custom-user-pin",
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:38px;height:38px;">
      <div style="position:absolute;width:38px;height:38px;border-radius:9999px;background:${color};opacity:0.35;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:26px;height:26px;border-radius:9999px;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;box-shadow:0 0 12px ${color};border:2.5px solid white;z-index:2;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>`,
    iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -19],
  });
};

const createFacilityIcon = (kind: string) => {
  const bg = kind === "police" ? "#1e40af" : kind === "hospital" ? "#dc2626" : kind === "pharmacy" ? "#047857" : "#0f766e";
  const symbol = kind === "hospital" ? "+" : kind === "police" ? "P" : kind === "pharmacy" ? "Rx" : "★";
  return L.divIcon({
    className: "custom-facility-pin",
    html: `<div style="width:24px;height:24px;border-radius:6px;background:${bg};display:flex;align-items:center;justify-content:center;color:white;border:1.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:11px;font-weight:800;">${symbol}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12],
  });
};

const createBeachIcon = (flag: string) => {
  const bg = flag === "green" ? "#10b981" : flag === "yellow" ? "#f59e0b" : "#ef4444";
  return L.divIcon({
    className: "beach-pin",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${bg};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:9px;">🏖</div>`,
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
  });
};

const createFerryIcon = (running: boolean) => {
  const bg = running ? "#0ea5e9" : "#6b7280";
  return L.divIcon({
    className: "ferry-pin",
    html: `<div style="width:22px;height:22px;border-radius:5px;background:${bg};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:10px;">⚓</div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -11],
  });
};

const createDangerRoadIcon = (risk: string) => {
  const bg = risk === "extreme" ? "#dc2626" : "#f59e0b";
  return L.divIcon({
    className: "danger-pin",
    html: `<div style="width:22px;height:22px;border-radius:4px;background:${bg};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:10px;">⚠</div>`,
    iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -11],
  });
};

export function SafetyMap({
  position,
  facilities = [],
  onPositionChange,
  showBeaches = true,
  showFerries = true,
  showDangerRoads = true,
}: {
  position?: GeoPoint | null;
  facilities?: Facility[];
  onPositionChange?: (pos: GeoPoint) => void;
  showBeaches?: boolean;
  showFerries?: boolean;
  showDangerRoads?: boolean;
}) {
  const activePos = position ?? DEFAULT_GOA_LOCATION;
  const isLiveGps = Boolean(position && position.lat !== DEFAULT_GOA_LOCATION.lat);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const allFacilities = facilities.length > 0 ? facilities : VERIFIED_GOA_FACILITIES;

  const handleMapClick = (lat: number, lng: number) => {
    onPositionChange?.({ lat, lng, accuracy: 15, timestamp: Date.now() });
  };

  // Use standard OSM tiles (free, no API key needed)
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[activePos.lat, activePos.lng]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full rounded-xl"
        aria-label="Interactive Safety Map — Goa"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />
        <MapFlyController center={[activePos.lat, activePos.lng]} zoom={12} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Accuracy circle */}
        <Circle
          center={[activePos.lat, activePos.lng]}
          radius={activePos.accuracy || 40}
          pathOptions={{ color: isLiveGps ? "#2563eb" : "#059669", weight: 1.5, fillColor: isLiveGps ? "#2563eb" : "#059669", fillOpacity: 0.1, dashArray: "4,4" }}
        />

        {/* User location */}
        <Marker position={[activePos.lat, activePos.lng]} icon={createUserMarkerIcon(isLiveGps)}>
          <Popup>
            <div className="p-1 text-slate-900">
              <div className="font-bold text-sm flex items-center gap-1.5">
                📍 {isLiveGps ? "Your Live GPS Location" : "GEC Farmagudi (Default)"}
              </div>
              <div className="text-xs text-slate-600 mt-1">Lat: {activePos.lat.toFixed(5)}, Lng: {activePos.lng.toFixed(5)}</div>
            </div>
          </Popup>
        </Marker>

        {/* Facility / Safe Haven markers */}
        {allFacilities.map(f => (
          <Marker key={f.id} position={[f.lat, f.lng]} icon={createFacilityIcon(f.kind)}>
            <Popup>
              <div className="p-1 text-slate-900 min-w-[180px]">
                <div className="font-bold text-sm flex items-center gap-1">🛡 {f.name}</div>
                <div className="text-xs text-slate-600 mt-0.5 capitalize">{f.kind} · {f.distanceKm.toFixed(1)} km</div>
                {f.phone && (
                  <a href={`tel:${f.phone}`} className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                    📞 {f.phone}
                  </a>
                )}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noreferrer"
                  className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-0.5 hover:underline">
                  🧭 Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Danger road overlays */}
        {showDangerRoads && DANGER_ROADS_MAP.map(road => (
          <span key={road.id}>
            <Polyline
              positions={road.points}
              pathOptions={{
                color: road.risk === "extreme" ? "#dc2626" : "#f59e0b",
                weight: road.risk === "extreme" ? 5 : 4,
                opacity: 0.85,
                dashArray: road.risk === "extreme" ? undefined : "8, 4"
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-bold">
                  {road.risk === "extreme" ? "🔴 EXTREME RISK" : "🟡 HIGH RISK"}<br/>
                  {road.name}
                </div>
              </Tooltip>
            </Polyline>
            <Marker position={road.points[Math.floor(road.points.length / 2)]} icon={createDangerRoadIcon(road.risk)}>
              <Popup>
                <div className="p-1 text-slate-900">
                  <div className="font-bold text-sm">⚠️ {road.name}</div>
                  <div className={`text-xs font-bold mt-1 ${road.risk === "extreme" ? "text-red-600" : "text-amber-600"}`}>
                    {road.risk.toUpperCase()} RISK ROAD
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Exercise extreme caution. Avoid night travel.</p>
                </div>
              </Popup>
            </Marker>
          </span>
        ))}

        {/* Beach markers */}
        {showBeaches && BEACH_MARKERS.map(beach => (
          <Marker key={beach.id} position={[beach.lat, beach.lng]} icon={createBeachIcon(beach.flag)}>
            <Popup>
              <div className="p-1 text-slate-900">
                <div className="font-bold text-sm">🏖 {beach.name}</div>
                <div className={`text-xs font-bold mt-1 ${beach.flag === "green" ? "text-emerald-600" : beach.flag === "yellow" ? "text-amber-600" : "text-red-600"}`}>
                  {beach.flag === "green" ? "🟢 Relatively Safe" : beach.flag === "yellow" ? "🟡 Caution" : "🔴 Dangerous — No Swimming"}
                </div>
                <a href="/beach" className="text-xs text-blue-600 hover:underline mt-1 block">View full beach report →</a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ferry markers */}
        {showFerries && FERRY_MARKERS.map(ferry => (
          <Marker key={ferry.id} position={[ferry.lat, ferry.lng]} icon={createFerryIcon(ferry.running)}>
            <Popup>
              <div className="p-1 text-slate-900">
                <div className="font-bold text-sm">⚓ {ferry.name}</div>
                <div className={`text-xs font-bold mt-1 ${ferry.running ? "text-emerald-600" : "text-gray-500"}`}>
                  {ferry.running ? "✅ Operating" : "⏸️ Closed/Suspended"}
                </div>
                <a href="/ferries" className="text-xs text-blue-600 hover:underline mt-1 block">Check full schedule →</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-2 text-[10px] shadow-lg border border-slate-200 dark:border-slate-800 pointer-events-auto space-y-1">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Your Location</div>
        {showDangerRoads && <div className="flex items-center gap-1.5"><div className="w-4 h-1.5 rounded bg-red-500" /> Danger Roads</div>}
        {showBeaches && <div className="flex items-center gap-1.5"><span>🏖</span> Beach Safety</div>}
        {showFerries && <div className="flex items-center gap-1.5"><span>⚓</span> Ferry Points</div>}
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-700 flex items-center justify-center text-white text-[7px] font-bold">+</div> Hospitals</div>
      </div>

      {/* Floating action buttons on map */}
      <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
        {/* Ask AI about this location */}
        <a
          href="/query"
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-lg shadow-violet-500/30 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI
        </a>
        {/* Photo accident upload → AI */}
        <a
          href="/query"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-lg shadow-red-500/30 transition-all"
          title="Take accident photo — AI will analyze and show nearest help"
        >
          <Camera className="w-3.5 h-3.5" />
          📸 Accident?
        </a>
        {/* Road emergency */}
        <a
          href="/road-emergency"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-lg shadow-orange-500/30 transition-all"
        >
          🚨 Emergency
        </a>
      </div>
    </div>
  );
}

export default SafetyMap;
