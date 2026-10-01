import type { GeoPoint } from "./types";

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
  { id: "haven-gec-gate", name: "GEC Main Security Gate & Intercom", kind: "security", lat: 15.4222, lng: 74.0075, distanceKm: 0.2, phone: "0832-2399100" },
  { id: "haven-ponda-hospital", name: "Ponda Sub-District Hospital (Casualty & ICU)", kind: "hospital", lat: 15.4060, lng: 74.0180, distanceKm: 2.1, phone: "0832-2312225" },
  { id: "haven-ponda-police", name: "Goa Police Station (112 Ponda Unit)", kind: "police", lat: 15.4010, lng: 74.0165, distanceKm: 2.5, phone: "0832-2312121" },
  { id: "haven-farmagudi-store", name: "Farmagudi 24/7 Safe Haven & Pharmacy", kind: "pharmacy", lat: 15.4280, lng: 74.0105, distanceKm: 0.6, phone: "0832-2399450" },
  { id: "haven-gmc-bambolim", name: "Goa Medical College (GMC) Trauma Center", kind: "hospital", lat: 15.4619, lng: 73.8560, distanceKm: 18.2, phone: "0832-2458725" },
  { id: "haven-panaji-police", name: "Panaji Police Station", kind: "police", lat: 15.4965, lng: 73.8290, distanceKm: 19.0, phone: "0832-2224488" },
];
