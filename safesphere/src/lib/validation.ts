import { z } from "zod";
import { normalizePhone, validatePhone } from "./format";
import { INCIDENT_CATEGORIES, MAX_DESCRIPTION, MIN_DESCRIPTION } from "./triage";

/** Shared by the browser forms and the API routes, so both enforce identical rules. */

export const RELATIONS = ["Family", "Friend", "Partner", "Roommate", "Colleague", "Neighbour", "Warden / Mentor", "Other"] as const;
export const MAX_CONTACTS = 10;
export const MAX_REPORTS = 200;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email, like name@example.com.";
  return null;
}

export function validatePassword(password: string, mode: "login" | "signup"): string | null {
  if (!password) return "Enter your password.";
  if (mode === "login") return null;
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use 128 characters or fewer.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Include at least one letter and one number.";
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Enter your name.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 60) return "Name must be 60 characters or fewer.";
  return null;
}

export function validateContactName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Enter a name (at least 2 characters).";
  if (trimmed.length > 50) return "Keep names under 50 characters.";
  return null;
}

export const ContactInput = z.object({
  name: z
    .string()
    .trim()
    .refine((value) => !validateContactName(value), { message: "Name must be 2–50 characters." }),
  phone: z
    .string()
    .refine((value) => !validatePhone(value), { message: "Enter a valid phone number (7–15 digits)." })
    .transform(normalizePhone),
  relation: z.enum(RELATIONS),
});

const GeoInput = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().max(100_000).optional(),
});

const AssistInput = z.object({
  engine: z.enum(["claude", "rule-based"]),
  suggestedCategory: z.enum(INCIDENT_CATEGORIES),
  confidence: z.enum(["low", "medium", "high"]),
  summary: z.string().max(600),
  accepted: z.boolean(),
});

export const ReportInput = z.object({
  category: z.enum(INCIDENT_CATEGORIES, { message: "Choose a valid category." }),
  description: z
    .string()
    .trim()
    .min(MIN_DESCRIPTION, `Describe the incident in at least ${MIN_DESCRIPTION} characters.`)
    .max(MAX_DESCRIPTION, `Keep the description under ${MAX_DESCRIPTION} characters.`),
  location: GeoInput.nullable().optional(),
  assist: AssistInput.nullable().optional(),
  shared: z.boolean().optional(),
});

export const ReportUpdate = ReportInput.pick({ category: true, description: true, shared: true }).partial();
