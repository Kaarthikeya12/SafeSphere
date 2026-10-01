"use client";

import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/types";

export type Facility = {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
};

function FitView({ position, facilities }: { position: GeoPoint; facilities: Facility[] }) {
  const map = useMap();
  const { lat, lng } = position;
  useEffect(() => {
    if (facilities.length) {
      const points: [number, number][] = [[lat, lng], ...facilities.map((f) => [f.lat, f.lng] as [number, number])];
      map.fitBounds(points, { padding: [30, 30], maxZoom: 16 });
    } else {
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
    }
  }, [map, lat, lng, facilities]);
  return null;
}

export default function SafetyMap({ position, facilities }: { position: GeoPoint; facilities: Facility[] }) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label="Map showing your location and nearby help"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position.accuracy ? (
        <Circle
          center={[position.lat, position.lng]}
          radius={position.accuracy}
          pathOptions={{ color: "#2563eb", weight: 1, fillColor: "#2563eb", fillOpacity: 0.08 }}
        />
      ) : null}
      {facilities.map((facility) => (
        <CircleMarker
          key={facility.id}
          center={[facility.lat, facility.lng]}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#0b1b3a", fillOpacity: 1 }}
        >
          <Tooltip>
            {facility.name} · {facility.distanceKm.toFixed(1)} km
          </Tooltip>
        </CircleMarker>
      ))}
      <CircleMarker center={[position.lat, position.lng]} radius={9} pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}>
        <Tooltip permanent direction="top" offset={[0, -8]}>
          You
        </Tooltip>
      </CircleMarker>
      <FitView position={position} facilities={facilities} />
    </MapContainer>
  );
}
