"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/types";
import { Shield, Phone, Navigation, MapPin } from "lucide-react";

export type Facility = {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
};

// Default fallback location: Goa College of Engineering (GEC), Farmagudi, Ponda
export const DEFAULT_GOA_LOCATION: GeoPoint = {
  lat: 15.4227,
  lng: 74.0089,
  accuracy: 10,
  timestamp: Date.now(),
};

// Verified Goa Emergency Havens
export const VERIFIED_GOA_FACILITIES: Facility[] = [
  {
    id: "haven-gec-gate",
    name: "GEC Main Security Gate & Intercom",
    kind: "security",
    lat: 15.4222,
    lng: 74.0075,
    distanceKm: 0.2,
    phone: "0832-2399100",
  },
  {
    id: "haven-ponda-hospital",
    name: "Ponda Sub-District Hospital (Casualty & ICU)",
    kind: "hospital",
    lat: 15.4060,
    lng: 74.0180,
    distanceKm: 2.1,
    phone: "0832-2312225",
  },
  {
    id: "haven-ponda-police",
    name: "Goa Police Station (112 Ponda Unit)",
    kind: "police",
    lat: 15.4010,
    lng: 74.0165,
    distanceKm: 2.5,
    phone: "0832-2312121",
  },
  {
    id: "haven-farmagudi-store",
    name: "Farmagudi 24/7 Safe Haven & Pharmacy",
    kind: "pharmacy",
    lat: 15.4280,
    lng: 74.0105,
    distanceKm: 0.6,
    phone: "0832-2399450",
  },
  {
    id: "haven-gmc-bambolim",
    name: "Goa Medical College (GMC) Trauma Center",
    kind: "hospital",
    lat: 15.4619,
    lng: 73.8560,
    distanceKm: 18.2,
    phone: "0832-2458725",
  },
];

// Controller component to smoothly fly map to active target
function MapFlyController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Click anywhere on map to reposition safety marker
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Custom SVG Pulse Marker for the Active User
const createUserMarkerIcon = (isLive: boolean) => {
  const color = isLive ? "#2563eb" : "#059669";
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
        <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 26px; height: 26px; border-radius: 9999px; background: ${color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 0 12px ${color}; border: 2.5px solid white; z-index: 2;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

const createFacilityIcon = (kind: string) => {
  const bg = kind === "police" ? "#1e40af" : kind === "hospital" ? "#dc2626" : kind === "pharmacy" ? "#047857" : "#0f766e";
  const symbol = kind === "hospital" ? "+" : kind === "police" ? "P" : kind === "pharmacy" ? "Rx" : "★";
  return L.divIcon({
    className: "custom-facility-pin",
    html: `
      <div style="width: 24px; height: 24px; border-radius: 6px; background: ${bg}; display: flex; align-items: center; justify-content: center; color: white; border: 1.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 11px; font-weight: 800;">
        ${symbol}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function SafetyMap({
  position,
  facilities = [],
  onPositionChange,
}: {
  position?: GeoPoint | null;
  facilities?: Facility[];
  onPositionChange?: (pos: GeoPoint) => void;
}) {
  const activePos = position ?? DEFAULT_GOA_LOCATION;
  const isLiveGps = Boolean(position && position.lat !== DEFAULT_GOA_LOCATION.lat);
  const [isDark, setIsDark] = useState(false);

  // Check theme dynamically
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Merge pre-seeded facilities with Overpass results if any
  const allFacilities = facilities.length > 0 ? facilities : VERIFIED_GOA_FACILITIES;

  const handleMapClick = (lat: number, lng: number) => {
    if (onPositionChange) {
      onPositionChange({
        lat,
        lng,
        accuracy: 15,
        timestamp: Date.now(),
      });
    }
  };

  // High quality tile URL for dark or light theme
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[activePos.lat, activePos.lng]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full rounded-xl"
        aria-label="Interactive Safety Map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />

        <MapFlyController center={[activePos.lat, activePos.lng]} zoom={15} />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Accuracy Range Circle */}
        <Circle
          center={[activePos.lat, activePos.lng]}
          radius={activePos.accuracy || 40}
          pathOptions={{
            color: isLiveGps ? "#2563eb" : "#059669",
            weight: 1.5,
            fillColor: isLiveGps ? "#2563eb" : "#059669",
            fillOpacity: 0.1,
            dashArray: "4, 4",
          }}
        />

        {/* User Active Position Marker */}
        <Marker position={[activePos.lat, activePos.lng]} icon={createUserMarkerIcon(isLiveGps)}>
          <Popup>
            <div className="p-1 text-slate-900">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 inline" />
                {isLiveGps ? "Your Live GPS Location" : "Goa College of Engineering (GEC)"}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Lat: {activePos.lat.toFixed(4)}, Lng: {activePos.lng.toFixed(4)}
              </div>
              <div className="text-[10px] bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded mt-2 inline-block">
                Tip: Click anywhere on map to reposition pin
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Facility & Safe Haven Markers */}
        {allFacilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createFacilityIcon(facility.kind)}
          >
            <Popup>
              <div className="p-1 text-slate-900 min-w-[180px]">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  {facility.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 capitalize">
                  {facility.kind} · {facility.distanceKm.toFixed(1)} km away
                </div>
                {facility.phone && (
                  <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <a href={`tel:${facility.phone}`} className="hover:underline">
                      {facility.phone}
                    </a>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Navigation className="w-3 h-3" /> Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Interactive Floating Map Helper Controls */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white/95 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-800 pointer-events-auto flex items-center gap-2">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-blue-600 animate-ping inline-block" />
          Click anywhere to set pin
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="text-muted">Goa Sector Grid</span>
      </div>
    </div>
  );
}
