import { GOA_LOCATIONS, INITIAL_RESPONDERS, type CommunityResponder, type LocationCoordinate } from './mock-data';

export type EmergencyType = 'harassment' | 'medical' | 'accident' | 'isolated_danger' | 'coastal_hazard';
export type EmergencySeverity = 'critical' | 'high' | 'moderate';
export type IncidentStatus = 'triggering' | 'active' | 'dispatched' | 'responder_on_scene' | 'resolved' | 'cancelled';

export interface EmergencyIncident {
  id: string;
  victimName: string;
  victimPhone: string;
  location: LocationCoordinate;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: IncidentStatus;
  timestamp: string;
  aiThreatScore: number;
  threatAnalysis: {
    urgency: string;
    actionRequired: string;
    detectedKeywords: string[];
    sentiment: string;
  };
  audioTranscript?: string;
  batteryLevel: number;
  assignedResponders: string[];
  notes: string[];
}

const INCIDENTS_KEY = 'safesphere_incidents';
const RESPONDERS_KEY = 'safesphere_responders';

class IncidentStoreService {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('safesphere_sync_mesh');
        this.channel.onmessage = () => {
          this.notifyListeners();
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or error:', err);
      }
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  private broadcastChange() {
    this.notifyListeners();
    try {
      this.channel?.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
    } catch {
      // Ignore broadcast errors
    }
  }

  getIncidents(): EmergencyIncident[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(INCIDENTS_KEY);
    if (!data) {
      // Seed initial high-fidelity incident at GEC Farmagudi Campus
      const sampleIncident: EmergencyIncident = {
        id: 'INC-GOA-101',
        victimName: 'Ananya Sharma',
        victimPhone: '+91 98224 81729',
        location: GOA_LOCATIONS[0],
        type: 'isolated_danger',
        severity: 'high',
        status: 'dispatched',
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        aiThreatScore: 84,
        threatAnalysis: {
          urgency: 'HIGH PRIORITY',
          actionRequired: 'Dispatch Campus Security & alert nearest Student Guardian',
          detectedKeywords: ['alone in dark stretch', 'unregistered motorcycle circling', 'low phone battery'],
          sentiment: 'High Fear & Agitation'
        },
        audioTranscript: 'Someone is following near the electrical substation... streetlights are dark',
        batteryLevel: 22,
        assignedResponders: ['resp-1', 'resp-3'],
        notes: ['Campus Security unit en route with patrol torch', 'ETA 2 mins']
      };
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify([sampleIncident]));
      return [sampleIncident];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getResponders(): CommunityResponder[] {
    if (typeof window === 'undefined') return INITIAL_RESPONDERS;
    const data = localStorage.getItem(RESPONDERS_KEY);
    if (!data) {
      localStorage.setItem(RESPONDERS_KEY, JSON.stringify(INITIAL_RESPONDERS));
      return INITIAL_RESPONDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_RESPONDERS;
    }
  }

  triggerSOS(params: {
    victimName: string;
    victimPhone: string;
    type: EmergencyType;
    locationIndex?: number;
    batteryLevel?: number;
    audioTranscript?: string;
  }): EmergencyIncident {
    const incidents = this.getIncidents();
    const locIdx = params.locationIndex ?? 0;
    const loc = GOA_LOCATIONS[locIdx] || GOA_LOCATIONS[0];

    const threatAnalysisMap: Record<EmergencyType, { urgency: string; actionRequired: string; keywords: string[] }> = {
      harassment: {
        urgency: 'IMMEDIATE THREAT',
        actionRequired: 'Deploy nearest bystander intervention & notify PCR Unit 112',
        keywords: ['stalking', 'intimidation', 'verbal aggression']
      },
      medical: {
        urgency: 'CODE RED MEDICAL',
        actionRequired: 'Rush EMT volunteer & dispatch 108 ambulance to GPS pin',
        keywords: ['collapse', 'unconscious', 'severe bleeding', 'chest pain']
      },
      accident: {
        urgency: 'ROAD RESCUE',
        actionRequired: 'Alert highway patrol & coordinate triage transport',
        keywords: ['collision', 'head trauma', 'highway block']
      },
      isolated_danger: {
        urgency: 'HIGH ESCALATION RISK',
        actionRequired: 'Deploy Campus Security & activate audible alarm',
        keywords: ['dark stretch', 'followed', 'no lighting']
      },
      coastal_hazard: {
        urgency: 'COASTAL WATER EMERGENCY',
        actionRequired: 'Alert Drishti Lifeguards & dispatch flotation aid',
        keywords: ['rip current', 'high tide', 'swept away']
      }
    };

    const analysis = threatAnalysisMap[params.type] || threatAnalysisMap.isolated_danger;
    const newIncident: EmergencyIncident = {
      id: `INC-GOA-${Math.floor(100 + Math.random() * 900)}`,
      victimName: params.victimName,
      victimPhone: params.victimPhone,
      location: loc,
      type: params.type,
      severity: params.type === 'medical' || params.type === 'harassment' ? 'critical' : 'high',
      status: 'active',
      timestamp: new Date().toISOString(),
      aiThreatScore: Math.floor(75 + Math.random() * 24),
      threatAnalysis: {
        urgency: analysis.urgency,
        actionRequired: analysis.actionRequired,
        detectedKeywords: analysis.keywords,
        sentiment: 'Acute Distress'
      },
      audioTranscript: params.audioTranscript || 'Live distress trigger captured by SafeSphere Mesh',
      batteryLevel: params.batteryLevel ?? 48,
      assignedResponders: [],
      notes: ['Automated AI triage complete. Beacons broadcast to 2km guardian radius.']
    };

    incidents.unshift(newIncident);
    if (typeof window !== 'undefined') {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
    }
    this.broadcastChange();
    return newIncident;
  }

  acceptIncidentByResponder(responderId: string, incidentId: string) {
    const incidents = this.getIncidents();
    const responders = this.getResponders();

    const incident = incidents.find((i) => i.id === incidentId);
    if (incident) {
      if (!incident.assignedResponders.includes(responderId)) {
        incident.assignedResponders.push(responderId);
      }
      incident.status = 'dispatched';
      incident.notes.push(`Responder ${responderId} accepted and is en route.`);
    }

    const responder = responders.find((r) => r.id === responderId);
    if (responder) {
      responder.currentStatus = 'responding';
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
      localStorage.setItem(RESPONDERS_KEY, JSON.stringify(responders));
    }
    this.broadcastChange();
  }

  resolveIncident(incidentId: string, resolutionNote: string) {
    const incidents = this.getIncidents();
    const responders = this.getResponders();

    const incident = incidents.find((i) => i.id === incidentId);
    if (incident) {
      incident.status = 'resolved';
      incident.notes.push(`RESOLVED: ${resolutionNote}`);

      incident.assignedResponders.forEach((respId) => {
        const resp = responders.find((r) => r.id === respId);
        if (resp) {
          resp.currentStatus = 'available';
        }
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents));
      localStorage.setItem(RESPONDERS_KEY, JSON.stringify(responders));
    }
    this.broadcastChange();
  }
}

export const incidentStore = new IncidentStoreService();
