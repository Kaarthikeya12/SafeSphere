"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert,
  Radio,
  Users,
  Clock,
  Activity,
  PlusCircle,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";
import { incidentStore, type EmergencyIncident } from "@/lib/incident-store";
import { GOA_LOCATIONS, type CommunityResponder, type SafeHavenZone, SAFE_HAVENS } from "@/lib/mock-data";
import { soundEngine } from "@/lib/sound";
import type { GeoPoint } from "@/lib/types";

const SafetyMap = dynamic(
  () => import("./safety-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[360px] rounded-2xl bg-[var(--card)] flex flex-col items-center justify-center gap-3 border border-[var(--border)]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[var(--muted)]">Initializing Goa GIS Command Operations Grid...</p>
      </div>
    ),
  }
);

interface CommandPanelProps {
  onNotify?: (msg: string, tone?: "neutral" | "positive" | "urgent") => void;
}

export function CommandPanel({ onNotify }: CommandPanelProps) {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(() => incidentStore.getIncidents());
  const [responders, setResponders] = useState<CommunityResponder[]>(() => incidentStore.getResponders());
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(() => {
    const list = incidentStore.getIncidents();
    return list.length > 0 ? list[0].id : null;
  });
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "critical" | "resolved">("all");

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setIncidents(incidentStore.getIncidents());
      setResponders(incidentStore.getResponders());
    });
    return () => unsubscribe();
  }, []);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0] || null;

  const displayedIncidents = incidents.filter((i) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return i.status !== "resolved";
    if (filterStatus === "critical") return i.severity === "critical";
    if (filterStatus === "resolved") return i.status === "resolved";
    return true;
  });

  const handleSimulateNewIncident = () => {
    const types = ["harassment", "medical", "accident", "coastal_hazard"] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomLocIdx = Math.floor(Math.random() * GOA_LOCATIONS.length);
    const names = ["Pooja Kamat", "Rahul Dessai", "Sneha Velingkar", "Vikram Prabhu", "Natasha Pereira"];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const incident = incidentStore.triggerSOS({
      victimName: randomName,
      victimPhone: `+91 9822${Math.floor(10000 + Math.random() * 90000)}`,
      type: randomType,
      locationIndex: randomLocIdx,
      batteryLevel: Math.floor(Math.random() * 30) + 12,
      audioTranscript: "Live emergency dispatch simulation triggered by Control Room",
    });

    setSelectedIncidentId(incident.id);
    soundEngine.playSiren(1.5);
    onNotify?.(`New ${incident.type.toUpperCase()} alert: ${incident.victimName} (${incident.location.name})`, "urgent");
  };

  const handleResolveIncident = (incidentId: string) => {
    incidentStore.resolveIncident(incidentId, "Control Room operator verified resolution with PCR squad");
    onNotify?.(`Incident ${incidentId} marked resolved by Command Center`, "positive");
  };

  const currentMapPoint: GeoPoint = selectedIncident
    ? {
        lat: selectedIncident.location.lat,
        lng: selectedIncident.location.lng,
        accuracy: 15,
        timestamp: Date.now(),
      }
    : {
        lat: 15.4227,
        lng: 74.0089,
        accuracy: 10,
        timestamp: Date.now(),
      };

  const mapFacilities = SAFE_HAVENS.map((sh) => ({
    id: sh.id,
    name: sh.name,
    kind: sh.type,
    lat: sh.lat,
    lng: sh.lng,
    distanceKm: 0.8,
    phone: sh.contactNumber,
  }));

  return (
    <div className="space-y-6">
      {/* Top Tactical Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--foreground)]">{activeIncidents.length}</div>
            <div className="text-xs text-[var(--muted)] font-medium">Active Distresses</div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
              {responders.filter((r) => r.currentStatus === "available").length} / {responders.length}
            </div>
            <div className="text-xs text-[var(--muted)] font-medium">Setu Guardians Available</div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--foreground)]">2.8 min</div>
            <div className="text-xs text-[var(--muted)] font-medium">Avg Guardian ETA (Goa)</div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[var(--foreground)]">99.4%</div>
            <div className="text-xs text-[var(--muted)] font-medium">AI Triage Accuracy</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Map & Tactical Queue), Right Column (Incident Details & AI Triage) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Map & Incident Queue */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tactical Map Container */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping inline-block" />
                  Live GIS Operations Grid
                </span>
                <h3 className="text-base font-bold text-[var(--foreground)] mt-0.5">Goa Sector Real-Time Response Map</h3>
              </div>

              <button
                onClick={handleSimulateNewIncident}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Simulate Distress (Judge Demo)
              </button>
            </div>

            <div className="h-[380px] w-full rounded-xl overflow-hidden border border-[var(--border)]">
              <SafetyMap
                position={currentMapPoint}
                facilities={mapFacilities}
              />
            </div>
          </div>

          {/* Incident Queue List */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Emergency Operations Queue ({displayedIncidents.length})
              </h3>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] text-xs">
                {(["all", "active", "critical", "resolved"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                      filterStatus === st
                        ? "bg-primary text-white shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {displayedIncidents.map((inc) => {
                const isSelected = inc.id === selectedIncidentId;
                const isResolved = inc.status === "resolved";

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                        : isResolved
                        ? "bg-[var(--background)] border-[var(--border)] opacity-60 hover:opacity-90"
                        : "bg-[var(--background)] border-[var(--border)] hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          inc.severity === "critical"
                            ? "bg-red-500/20 text-red-500 border border-red-500/30"
                            : inc.severity === "high"
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                        }`}
                      >
                        {inc.severity === "critical" ? "CRIT" : inc.severity === "high" ? "HIGH" : "WARN"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--foreground)]">{inc.victimName}</span>
                          <span className="text-[10px] text-[var(--muted)] font-mono">{inc.id}</span>
                          {isResolved && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                              RESOLVED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span className="line-clamp-1">{inc.location.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-mono font-bold text-red-500">{inc.aiThreatScore}% Threat</span>
                      <span className="text-[10px] text-[var(--muted)]">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Incident Deep Dive & Real-Time AI Triage Analysis */}
        <div className="lg:col-span-5 space-y-5">
          {selectedIncident ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{selectedIncident.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        selectedIncident.severity === "critical"
                          ? "bg-red-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)] mt-1">{selectedIncident.victimName}</h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[var(--muted)] uppercase font-semibold">Battery</div>
                  <div className="text-xs font-mono font-bold text-[var(--foreground)]">{selectedIncident.batteryLevel}% Remaining</div>
                </div>
              </div>

              {/* Victim Contact & Coordinates */}
              <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Phone:</span>
                  <a href={`tel:${selectedIncident.victimPhone}`} className="font-mono text-primary font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedIncident.victimPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Location:</span>
                  <span className="font-semibold text-[var(--foreground)] text-right">{selectedIncident.location.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">GPS Coordinates:</span>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {selectedIncident.location.lat.toFixed(4)}, {selectedIncident.location.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* AI Triage Threat Diagnostics */}
              <div className="border border-purple-500/20 bg-purple-500/5 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Triage Threat Diagnostics
                  </div>
                  <span className="text-xs font-mono font-bold text-red-500">
                    Score: {selectedIncident.aiThreatScore}/100
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div>
                    <span className="text-[var(--muted)]">Action Protocol: </span>
                    <span className="font-bold text-[var(--foreground)]">{selectedIncident.threatAnalysis.actionRequired}</span>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Sentiment: </span>
                    <span className="font-medium text-amber-500">{selectedIncident.threatAnalysis.sentiment}</span>
                  </div>
                  {selectedIncident.threatAnalysis.detectedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedIncident.threatAnalysis.detectedKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedIncident.audioTranscript && (
                  <div className="pt-2 border-t border-purple-500/20 text-[11px] text-[var(--foreground)] italic">
                    "{selectedIncident.audioTranscript}"
                  </div>
                )}
              </div>

              {/* Assigned Guardians */}
              <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] text-xs space-y-2">
                <span className="font-bold text-[var(--foreground)] block">Assigned First Responders:</span>
                {selectedIncident.assignedResponders.length === 0 ? (
                  <p className="text-[11px] text-[var(--muted)] italic">
                    No guardian assigned yet. Distributing alert beacons across 2km radius...
                  </p>
                ) : (
                  <div className="space-y-1">
                    {selectedIncident.assignedResponders.map((respId) => {
                      const r = responders.find((resp) => resp.id === respId);
                      return (
                        <div key={respId} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
                          <span className="font-semibold text-[var(--foreground)]">{r?.name || respId}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                            {r?.role || "Guardian"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                {selectedIncident.status !== "resolved" ? (
                  <button
                    onClick={() => handleResolveIncident(selectedIncident.id)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Close Incident
                  </button>
                ) : (
                  <div className="flex-1 py-2 text-center text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    Incident Formally Closed & Archived
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center text-[var(--muted)] text-xs">
              Select an incident from the queue to view tactical telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
