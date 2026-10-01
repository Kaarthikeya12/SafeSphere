"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  HeartPulse,
  Award,
  Navigation,
} from "lucide-react";
import { incidentStore, type EmergencyIncident } from "@/lib/incident-store";
import { type CommunityResponder } from "@/lib/mock-data";
import { soundEngine } from "@/lib/sound";

interface ResponderPanelProps {
  onNotify?: (msg: string, tone?: "neutral" | "positive" | "urgent") => void;
}

export function ResponderPanel({ onNotify }: ResponderPanelProps) {
  const [responders, setResponders] = useState<CommunityResponder[]>(() => incidentStore.getResponders());
  const [activeResponderId, setActiveResponderId] = useState<string>("resp-1");
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(() => incidentStore.getIncidents());
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = incidentStore.subscribe(() => {
      setResponders(incidentStore.getResponders());
      setIncidents(incidentStore.getIncidents());
    });
    return () => unsubscribe();
  }, []);

  const currentResponder = responders.find((r) => r.id === activeResponderId) || responders[0];
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");

  const handleAccept = (incident: EmergencyIncident) => {
    incidentStore.acceptIncidentByResponder(currentResponder.id, incident.id);
    soundEngine.playSiren(1.2);
    soundEngine.speakText(`You accepted response for ${incident.victimName}. Rushing to ${incident.location.name}.`);
    onNotify?.(`En route to ${incident.victimName} (${incident.location.name})`, "urgent");
  };

  const handleResolve = (incident: EmergencyIncident) => {
    incidentStore.resolveIncident(incident.id, `Resolved by Guardian ${currentResponder.name} (${currentResponder.role})`);
    soundEngine.speakText(`Incident ${incident.id} marked safely resolved. Well done guardian.`);
    onNotify?.(`Incident ${incident.id} safely resolved!`, "positive");
  };

  const protocols = [
    {
      id: "cpr",
      title: "CPR Emergency Protocol",
      icon: "🫀",
      steps: [
        "1. Check responsiveness and call Goa 108 ambulance immediately.",
        "2. Place hands center of chest, lock elbows vertically.",
        "3. Push hard and fast: 100–120 compressions per minute (to the beat of Stayin’ Alive).",
        "4. 30 chest compressions followed by 2 rescue breaths if trained.",
      ],
    },
    {
      id: "harass",
      title: "Harassment Bystander Intervention (5Ds)",
      icon: "🛡️",
      steps: [
        '1. Direct Approach: Step in and engage victim ("Hey, there you are, come let’s go").',
        "2. Distract: Ask victim for the time or directions to defuse stalker.",
        "3. Delegate: Escort victim to nearest lit Safe Haven (e.g., GEC Security Gate).",
        "4. Delay: Maintain distance from aggressor; dial 112 if physical threat escalates.",
      ],
    },
    {
      id: "bleeding",
      title: "Trauma & Severe Bleeding",
      icon: "🩹",
      steps: [
        "1. Apply firm, continuous direct pressure with clean cloth or sterile dressing.",
        "2. Do not remove soaked gauze; layer fresh cloth over it.",
        "3. Keep victim calm and elevate feet if conscious to reduce shock.",
        "4. Guide 108 emergency vehicle to exact GPS landmark.",
      ],
    },
    {
      id: "rip_current",
      title: "Goa Coastal Rip Current Rescue",
      icon: "🌊",
      steps: [
        "1. Do not enter turbulent surf without flotation aid (ring buoy or bodyboard).",
        '2. Shout to victim: "Swim parallel to shore, do NOT fight the seaward current!"',
        "3. Alert Drishti Marine Lifeguard tower immediately via beach post.",
        "4. Prepare CPR and warm dry blanket on beach.",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Guardian Profile Selector */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={currentResponder.avatar}
              alt={currentResponder.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-primary shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5" title="Verified Volunteer">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--foreground)]">{currentResponder.name}</h2>
              <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                {currentResponder.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
              <span>★ {currentResponder.rating} Rating</span>
              <span>•</span>
              <span className="font-mono">{currentResponder.phone}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active on Mesh
              </span>
            </div>
          </div>
        </div>

        {/* Switch Persona for Demo / Roleplay */}
        <div className="w-full md:w-auto">
          <label className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
            Simulate Guardian Role:
          </label>
          <select
            value={activeResponderId}
            onChange={(e) => setActiveResponderId(e.target.value)}
            className="w-full md:w-64 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {responders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Active Incidents Nearby + Protocol Cheat Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Active Incidents Requiring Response */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Distress Incidents Within Geofence ({activeIncidents.length})
            </h3>
            <span className="text-xs text-[var(--muted)]">Live 2km Mesh Radius</span>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[var(--foreground)]">All Clear in Farmagudi / Goa Sector</h4>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                No active SOS distress beacons right now. You are connected as a first-responder guardian. You will be
                notified instantly if a nearby emergency triggers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeIncidents.map((incident) => {
                const isAssignedToMe = incident.assignedResponders.includes(currentResponder.id);
                const isCritical = incident.severity === "critical";

                return (
                  <div
                    key={incident.id}
                    className={`border rounded-2xl p-5 transition-all shadow-sm ${
                      isCritical
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-[var(--card)] border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isCritical ? "bg-red-600 text-white" : "bg-amber-600 text-white"
                            }`}
                          >
                            {incident.severity}
                          </span>
                          <span className="text-xs font-mono text-[var(--muted)]">{incident.id}</span>
                          <span className="text-[11px] text-[var(--muted)]">
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[var(--foreground)] mt-1.5 flex items-center gap-2">
                          <span>{incident.victimName}</span>
                          <span className="text-xs font-normal text-[var(--muted)]">({incident.victimPhone})</span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/80 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{incident.location.name}</span>
                        </div>
                      </div>

                      {/* AI Threat Score Badge */}
                      <div className="text-right">
                        <div className="text-xs text-[var(--muted)] font-medium">AI Threat Index</div>
                        <div className="text-2xl font-bold font-mono text-red-500">{incident.aiThreatScore}%</div>
                      </div>
                    </div>

                    {/* Threat Analysis & Keywords */}
                    <div className="mt-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Type:</span>
                        <span className="font-bold text-[var(--foreground)] uppercase">{incident.type.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted)]">Recommended Action:</span>
                        <span className="font-bold text-amber-500">{incident.threatAnalysis.actionRequired}</span>
                      </div>
                      {incident.audioTranscript && (
                        <div className="pt-1 border-t border-[var(--border)] text-[11px] text-primary italic">
                          "{incident.audioTranscript}"
                        </div>
                      )}
                    </div>

                    {/* Responder Action Buttons */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono">
                        <Navigation className="w-3.5 h-3.5 text-primary" />
                        <span>Distance: ~{currentResponder.distanceKm} km</span>
                        <span>•</span>
                        <span>ETA: ~{currentResponder.etaMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${incident.victimPhone}`}
                          className="p-2 bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-xl text-xs font-bold transition flex items-center gap-1"
                          title="Call Victim"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {isAssignedToMe ? (
                          <button
                            onClick={() => handleResolve(incident)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark Safely Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAccept(incident)}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Accept & Rush to Scene
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Emergency Field Protocols & First-Aid Guides */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Sankalp Setu Guardian Protocols
            </h3>
            <span className="text-[10px] text-[var(--muted)]">Field Quick-Reference</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {protocols.map((proto) => {
              const isOpen = selectedProtocol === proto.id;
              return (
                <div
                  key={proto.id}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer ${
                    isOpen ? "bg-[var(--card)] border-primary shadow-sm" : "bg-[var(--card)] border-[var(--border)] hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedProtocol(isOpen ? null : proto.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{proto.icon}</span>
                      <span className="font-bold text-xs text-[var(--foreground)]">{proto.title}</span>
                    </div>
                    <span className="text-xs text-[var(--muted)] font-bold">{isOpen ? "▲" : "▼"}</span>
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                      {proto.steps.map((st, i) => (
                        <div key={i} className="text-xs text-[var(--muted)] flex items-start gap-1.5 leading-relaxed">
                          <span>{st}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Seva Sankalp Guardian Pledge Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-[var(--foreground)] space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Award className="w-4 h-4" />
              Seva Sankalp Guardian Community
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Every verified citizen volunteer and student in Goa creates a human safety net. By bridging the critical
              first 3–7 minutes before official police/ambulances arrive, community guardians save lives and deter crime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
