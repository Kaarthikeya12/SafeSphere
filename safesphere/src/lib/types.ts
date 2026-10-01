import type { IncidentCategory, TriageResult } from "./triage";

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  createdAt: number;
};

export type ReportAssist = Pick<TriageResult, "engine" | "suggestedCategory" | "confidence" | "summary">;

export type IncidentReport = {
  id: string;
  category: IncidentCategory;
  description: string;
  createdAt: number;
  updatedAt: number;
  location?: Pick<GeoPoint, "lat" | "lng" | "accuracy">;
  /** What the assistant suggested, so users/judges can compare it with what was saved. */
  assist?: ReportAssist & { accepted: boolean };
  /** Opt-in: an anonymised copy is visible to other signed-in users. */
  shared: boolean;
};

/** Community view of a shared report: no author, coarse location only. */
export type CommunityReport = {
  id: string;
  category: IncidentCategory;
  description: string;
  createdAt: number;
  area?: { lat: number; lng: number };
  mine: boolean;
};

export type SosState = {
  activatedAt: number;
  location?: GeoPoint;
  locationError?: string;
};

export type CheckIn = {
  startedAt: number;
  deadline: number;
  minutes: number;
  label?: string;
  /** Set when the user has seen and dismissed the expiry alert. */
  acknowledgedAt?: number;
};
