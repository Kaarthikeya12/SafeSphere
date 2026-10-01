/**
 * Incident understanding: shared types + deterministic rule-based baseline.
 *
 * The baseline is NOT AI. It is a transparent keyword scorer that always works
 * offline and is used (a) when no AI key is configured on the server, (b) when
 * the AI call fails or times out, and (c) instantly in the browser as a preview.
 * It suggests; the user always reviews and decides.
 */

export const INCIDENT_CATEGORIES = [
  "Road accident",
  "Fire",
  "Flooding",
  "Severe weather / natural hazard",
  "Medical emergency",
  "Unsafe location",
  "Infrastructure hazard",
  "Other",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];
export type Confidence = "low" | "medium" | "high";

export type TriageFields = {
  what: string;
  where: string | null;
  when: string | null;
  peopleAffected: string | null;
  hazardsMentioned: string[];
};

export type TriageResult = {
  engine: "claude" | "rule-based";
  model?: string;
  fallbackReason?: string;
  suggestedCategory: IncidentCategory;
  confidence: Confidence;
  alternatives: IncidentCategory[];
  summary: string;
  fields: TriageFields;
  /** Phrases in the user's text that usually warrant calling 112 now. Not a prediction. */
  urgentCues: string[];
  uncertainty: string;
  rationale: string;
};

export const MAX_DESCRIPTION = 2000;
export const MIN_DESCRIPTION = 10;

const KEYWORDS: Record<Exclude<IncidentCategory, "Other">, string[]> = {
  "Medical emergency": [
    "unconscious", "fainted", "faint", "collapsed", "not breathing", "breathing", "chest pain", "heart attack", "stroke",
    "seizure", "fits", "bleeding", "blood", "injured", "injury", "hurt", "ambulance", "snake bite", "snakebite", "poison",
    "overdose", "allergic", "fever", "drowning", "drowned", "pregnant", "labour", "labor", "heatstroke", "khoon", "behosh",
  ],
  Fire: [
    "fire", "smoke", "burning", "flames", "blaze", "gas leak", "cylinder", "lpg", "short circuit", "sparks",
    "explosion", "aag", "burnt", "burned",
  ],
  "Road accident": [
    "accident", "crash", "collision", "collided", "hit by", "bike", "scooter", "car", "truck", "bus accident", "lorry",
    "vehicle", "overturned", "skidded", "pedestrian", "hit and run", "highway", "two-wheeler", "auto rickshaw",
  ],
  Flooding: [
    "flood", "flooding", "flooded", "waterlogging", "waterlogged", "water level", "rising water", "water rising",
    "water is rising", "water rose", "knee-deep", "waist-deep", "stuck in water",
    "overflowing", "overflow", "submerged", "inundated", "drain overflow", "paani",
  ],
  "Severe weather / natural hazard": [
    "storm", "cyclone", "heavy rain", "lightning", "thunder", "hailstorm", "strong wind", "gale", "heatwave", "heat wave",
    "tree fell", "tree fallen", "uprooted", "landslide", "mudslide", "earthquake", "tremor", "high tide", "tsunami",
    "rip current", "barish",
  ],
  "Unsafe location": [
    "harass", "harassed", "harassment", "stalking", "stalked", "following me", "followed me", "catcall", "groped",
    "eve teasing", "threatened", "threat", "abuse", "abused", "assault", "attacked", "molest", "unsafe", "scared",
    "afraid", "suspicious", "loitering", "unattended bag", "theft", "stolen", "robbery", "snatched", "chain snatching",
    "no lights", "dark road", "deserted", "isolated",
  ],
  "Infrastructure hazard": [
    "pothole", "open drain", "open manhole", "manhole", "streetlight", "street light", "broken railing",
    "collapsed wall", "crack", "exposed wire", "live wire", "electric pole", "fallen wire", "broken footpath",
    "construction", "debris", "bridge", "signal not working", "broken signal",
  ],
};

const URGENT_CUES = [
  "not breathing", "unconscious", "collapsed", "chest pain", "heavy bleeding", "bleeding heavily", "seizure", "trapped",
  "stuck inside", "fire spreading", "spreading fast", "explosion", "gas leak", "weapon", "knife", "gun", "attacked",
  "assault", "drowning", "live wire", "can't move", "cannot move", "help me", "children inside", "kids inside",
];

const HAZARD_TERMS = [
  "fire", "smoke", "gas leak", "live wire", "exposed wire", "flood", "rising water", "landslide", "fallen tree",
  "tree fell", "traffic", "debris", "weapon", "knife", "open manhole", "open drain", "lightning",
];

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function contains(text: string, term: string) {
  return new RegExp(`\\b${escapeRegExp(term)}(?:s|es|ed|ing)?\\b`, "i").test(text);
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim().replace(/[.,;]+$/, "");
  }
  return null;
}

export function ruleBasedTriage(description: string): TriageResult {
  const text = description.replace(/\s+/g, " ").trim();
  const scores = (Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[])
    .map((category) => {
      const hits = KEYWORDS[category].filter((term) => contains(text, term));
      // Multi-word phrases ("water is rising") are more specific than single words ("scooter"), so they count double.
      const score = hits.reduce((sum, term) => sum + (term.includes(" ") ? 2 : 1), 0);
      return { category, hits, score };
    })
    .sort((a, b) => b.score - a.score);

  const [top, second] = scores;
  const matched = scores.filter((entry) => entry.score > 0);

  let suggestedCategory: IncidentCategory = "Other";
  let confidence: Confidence = "low";
  if (top.score > 0) {
    suggestedCategory = top.category;
    const margin = top.score - (second?.score ?? 0);
    confidence = top.score >= 3 && margin >= 2 ? "high" : top.score >= 2 && margin >= 1 ? "medium" : "low";
  }

  const where = firstMatch(text, [
    /\b(?:near|at|in front of|opposite|outside|behind|beside|next to|inside)\s+(?:the\s+)?[A-Za-z0-9'’ -]{3,40}?(?=[,.;!?]|\s+(?:and|at|around|when|where|who|is|was|there)\b|$)/i,
    /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:Road|Rd|Street|St|Market|Junction|Circle|Bridge|Beach|Station|Hospital|College|School|Nagar|Colony)\b/,
  ]);
  const when = firstMatch(text, [
    /\b\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)/i,
    /\b(?:just now|right now|a few minutes ago|\d+\s(?:minutes?|mins?|hours?|hrs?)\sago|this (?:morning|afternoon|evening)|tonight|last night|yesterday|today)\b/i,
  ]);
  const peopleAffected = firstMatch(text, [
    /\b(?:\d+|one|two|three|four|five|six|several|many|a few|some)\s(?:people|persons|men|women|children|kids|students|passengers|riders|elderly|person|man|woman|child|boy|girl)\b/i,
    /\b(?:an?\s)?(?:old|elderly|young)?\s?(?:man|woman|child|boy|girl|person|student|driver|rider)\b/i,
  ]);
  const hazardsMentioned = HAZARD_TERMS.filter((term) => contains(text, term));
  const urgentCues = URGENT_CUES.filter((term) => contains(text, term));

  const firstSentence = (text.split(/(?<=[.!?])\s/)[0] ?? text).slice(0, 160);
  const summary = `${suggestedCategory}: ${firstSentence}${firstSentence.length < text.length ? "…" : ""}`;

  const notes: string[] = [];
  if (top.score === 0) notes.push("No known keywords matched, so the category defaulted to “Other”.");
  if (matched.length > 1) notes.push(`Keywords for ${matched.length} categories matched; the top match may not be the best fit.`);
  if (!where) notes.push("No clear location phrase was found in the text.");
  notes.push("Keyword matching cannot understand negation, sarcasm or context (e.g. “no fire” still counts as fire).");

  return {
    engine: "rule-based",
    suggestedCategory,
    confidence,
    alternatives: matched.slice(1, 3).map((entry) => entry.category),
    summary,
    fields: { what: firstSentence, where, when, peopleAffected, hazardsMentioned },
    urgentCues,
    uncertainty: notes.join(" "),
    rationale:
      top.score > 0
        ? `Matched keywords for “${top.category}”: ${top.hits.slice(0, 6).map((hit) => `“${hit}”`).join(", ")}.`
        : "No category keywords matched.",
  };
}

export function isIncidentCategory(value: unknown): value is IncidentCategory {
  return typeof value === "string" && (INCIDENT_CATEGORIES as readonly string[]).includes(value);
}
