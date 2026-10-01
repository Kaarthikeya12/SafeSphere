import { NextResponse } from 'next/server';

// ─── Groq API helper ───────────────────────────────────────────────────────
// Groq is OpenAI-compatible. Free tier: https://console.groq.com
// Model: qwen/qwen3.8-27b (text) | llama-3.2-11b-vision-preview (vision)

async function callGroq(messages: object[], model = 'qwen/qwen3.8-27b', jsonMode = false) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_key_here') {
    throw new Error('NO_KEY');
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.25,
    max_tokens: 768,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Goa safety system prompt ─────────────────────────────────────────────
const GOA_SYSTEM_PROMPT = `You are SafeSphere AI — Goa's hyper-local safety intelligence assistant.

DEEP KNOWLEDGE BASE:
• Beaches: Calangute (rip risk HIGH), Anjuna (NO lifeguards, HIGH risk), Vagator (HIGH risk, rocky), Palolem (SAFE, sheltered bay), Arambol (LOW risk), Miramar (LOW risk, near Panaji), Colva (MEDIUM, lifeguards), Benaulim (LOW, lifeguards), Baga (MEDIUM), Morjim (LOW, turtle zone), Querim (HIGH, river mouth), Agonda (LOW, remote), Patnem (LOW)
• Ferries: Panaji-Betim (busy, 6AM-11PM), Querim-Tiracol (every 30min), Siolim-Chopdem (20min), Agassaim-Curca (30min), Cavelossim-Assolna (suspended monsoon), Aldona-Corjuem (suspended monsoon). GSWTD: 0832-2224888
• Danger Roads: NH-4A Khandepar Ghats (EXTREME: zero signal, blind bends, wildlife), Dudhsagar approach (EXTREME: closed Jun-Sep, flash floods, elephants), Sanguem-Mollem (EXTREME: no lights, leopards/bison), Calangute-Anjuna night (HIGH: no lights, speeding), NH-748 Old Goa-Ponda (HIGH: heavy trucks)
• Hospitals: GMC Bambolim 0832-2458725 (Level 1 trauma), Ponda Sub-District 0832-2312225, Mapusa Sub-District 0832-2262372, Margao District 0832-2705664, Canacona PHC 0832-2643222
• Police: 112 (all Goa), Panaji 0832-2224488, Calangute 0832-2277254, Ponda 0832-2312121, Margao 0832-2705020
• Emergency: 112 police/rescue, 108 ambulance, 101 fire, Drishti Lifeguards +91-832-2464333, Coast Guard 1554
• Monsoon (Jun-Sep): rough seas, road washouts, ferry suspensions, Dudhsagar closed, waterlogging at Panaji causeway
• Wildlife: Bhagwan Mahaveer Sanctuary (leopard, gaur/bison, king cobra), Mhadei (elephant), crocodiles in Zuari/Mandovi rivers during monsoon
• Culture: Carnival (Feb), Shigmo (Mar), temple festivals cause sudden road blocks

RESPONSE FORMAT — always return valid JSON:
{
  "answer": "Direct answer in 3-5 sentences with specific Goa facts",
  "safetyRating": "safe" | "caution" | "danger",
  "coordinates": null | {"lat": number, "lng": number},
  "emergencyNumber": null | "112",
  "tips": ["tip1", "tip2"],
  "nearbyFacilities": null | [{"name": "...", "type": "hospital|police|lifeguard", "phone": "...", "lat": number, "lng": number}]
}

RULES:
1. If life-threatening: set emergencyNumber to "112" and safetyRating to "danger"  
2. Include exact phone numbers always
3. Set coordinates to the specific Goa location mentioned
4. Keep answer concise and actionable
5. nearbyFacilities: include 1-2 closest relevant facilities if location is identifiable`;

// ─── Photo analysis prompt ────────────────────────────────────────────────
const PHOTO_SYSTEM_PROMPT = `You are SafeSphere AI analyzing an emergency photo from Goa, India.
Analyze the image and identify:
1. What type of emergency/hazard is visible (accident, flooding, fire, injury, road damage, etc.)
2. Severity level: safe/caution/danger
3. Immediate actions required
4. Which Goa emergency number to call

Return JSON:
{
  "answer": "What you see and what to do immediately",
  "safetyRating": "safe" | "caution" | "danger",
  "detectedSituation": "road_accident | flooding | fire | medical | hazard | beach_danger | wildlife | other",
  "emergencyNumber": "112" | "108" | "101" | null,
  "tips": ["action1", "action2", "action3"],
  "coordinates": null
}`;

// ─── Main route ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, lat, lng, imageBase64, imageType } = body;

    // ── Photo analysis mode ──────────────────────────────────────────
    if (imageBase64) {
      try {
        const visionMessages = [
          { role: 'system', content: PHOTO_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageType || 'image/jpeg'};base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: query
                  ? `User says: "${query}". ${lat && lng ? `GPS: ${lat}, ${lng} (Goa).` : ''} Analyze this emergency image and respond in JSON.`
                  : `${lat && lng ? `GPS location: ${lat}, ${lng} in Goa.` : ''} Analyze this emergency image and respond in JSON.`,
              },
            ],
          },
        ];

        const content = await callGroq(visionMessages, 'llama-3.2-11b-vision-preview', false);
        let parsed;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { answer: content, safetyRating: 'caution', tips: [] };
        } catch {
          parsed = { answer: content, safetyRating: 'caution', tips: [] };
        }

        // Add nearest facilities based on GPS + detected situation
        const facilities = getNearbyFacilities(lat, lng, parsed.detectedSituation);
        return NextResponse.json({ ...parsed, nearbyFacilities: facilities, engine: 'groq-vision-llama3.2-11b', mode: 'photo' });
      } catch (err) {
        // Vision fallback — analyze without image
        const textContent = await callGroq([
          { role: 'system', content: GOA_SYSTEM_PROMPT },
          { role: 'user', content: `User uploaded an accident/emergency photo. ${query || 'Please provide emergency guidance for a road accident in Goa.'} ${lat && lng ? `GPS: ${lat}, ${lng}.` : ''} Respond in JSON.` }
        ], 'qwen/qwen3.8-27b', true).catch(() => null);

        if (textContent) {
          try {
            const parsed = JSON.parse(textContent);
            return NextResponse.json({ ...parsed, engine: 'groq-text-fallback', mode: 'photo-text-fallback' });
          } catch {}
        }
        console.error('Vision error:', err);
      }
    }

    // ── Text query mode ──────────────────────────────────────────────
    const trimmedQuery = (query ?? '').trim();
    if (!trimmedQuery && !imageBase64) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const locationCtx = lat && lng ? `User GPS: ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)} (Goa).` : '';

    let content: string;
    try {
      content = await callGroq([
        { role: 'system', content: GOA_SYSTEM_PROMPT },
        { role: 'user', content: `${locationCtx} Question: ${trimmedQuery}` }
      ], 'qwen/qwen3.8-27b', true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'NO_KEY') {
        // Rule-based fallback — no API key configured
        return NextResponse.json({
          answer: generateFallbackAnswer(trimmedQuery),
          safetyRating: detectSafetyRating(trimmedQuery),
          coordinates: extractLocationCoords(trimmedQuery),
          emergencyNumber: needsEmergency(trimmedQuery) ? '112' : null,
          tips: generateTips(trimmedQuery),
          nearbyFacilities: null,
          engine: 'rule-based (no GROQ_API_KEY set)',
        });
      }
      throw err;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Groq returned non-JSON — extract it
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      try {
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { answer: content, safetyRating: 'caution', tips: [] };
      } catch {
        parsed = { answer: content, safetyRating: 'caution', tips: [] };
      }
    }

    // Enrich with nearby facilities from GPS
    const facilities = getNearbyFacilities(lat, lng, null);
    if (facilities.length > 0 && !parsed.nearbyFacilities) {
      parsed.nearbyFacilities = facilities;
    }

    return NextResponse.json({ ...parsed, engine: 'groq-qwen-3.8-27b', mode: 'text' });
  } catch (err) {
    console.error('AI query error:', err);
    return NextResponse.json({
      answer: 'Groq AI is temporarily unavailable. For emergencies: CALL 112. Ambulance: 108. Drishti Lifeguards: +91-832-2464333.',
      safetyRating: 'caution',
      coordinates: null,
      emergencyNumber: '112',
      tips: ['Call 112 for all emergencies', 'Ambulance: 108', 'Fire: 101', 'Drishti Lifeguards: +91-832-2464333'],
      nearbyFacilities: null,
      engine: 'error-fallback',
    }, { status: 200 });
  }
}

// ─── Nearby facilities from GPS ───────────────────────────────────────────
function getNearbyFacilities(lat?: number, lng?: number, situation?: string | null) {
  if (!lat || !lng) return [];

  const allFacilities = [
    { name: 'Goa Medical College (GMC)', type: 'hospital', phone: '0832-2458725', lat: 15.4619, lng: 73.8560 },
    { name: 'Ponda Sub-District Hospital', type: 'hospital', phone: '0832-2312225', lat: 15.4060, lng: 74.0180 },
    { name: 'Mapusa Sub-District Hospital', type: 'hospital', phone: '0832-2262372', lat: 15.5917, lng: 73.8118 },
    { name: 'Margao District Hospital', type: 'hospital', phone: '0832-2705664', lat: 15.2736, lng: 73.9582 },
    { name: 'Panaji Police Station', type: 'police', phone: '0832-2224488', lat: 15.4965, lng: 73.8290 },
    { name: 'Calangute Police Station', type: 'police', phone: '0832-2277254', lat: 15.5439, lng: 73.7553 },
    { name: 'Ponda Police Station', type: 'police', phone: '0832-2312121', lat: 15.4010, lng: 74.0165 },
    { name: 'Margao Police Station', type: 'police', phone: '0832-2705020', lat: 15.2736, lng: 73.9582 },
    { name: 'Drishti Marine Lifeguards HQ', type: 'lifeguard', phone: '+918322464333', lat: 15.5439, lng: 73.7553 },
  ];

  // Calculate distance and sort
  const withDistance = allFacilities.map(f => ({
    ...f,
    distanceKm: haversine(lat, lng, f.lat, f.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Return top 2 hospitals + 1 police (or situation-relevant)
  const result = [];
  if (situation === 'medical' || situation === 'road_accident') {
    result.push(...withDistance.filter(f => f.type === 'hospital').slice(0, 2));
    result.push(...withDistance.filter(f => f.type === 'police').slice(0, 1));
  } else if (situation === 'beach_danger') {
    result.push(...withDistance.filter(f => f.type === 'lifeguard').slice(0, 1));
    result.push(...withDistance.filter(f => f.type === 'hospital').slice(0, 1));
  } else {
    result.push(...withDistance.filter(f => f.type === 'hospital').slice(0, 1));
    result.push(...withDistance.filter(f => f.type === 'police').slice(0, 1));
  }

  return result.map(f => ({
    name: f.name,
    type: f.type,
    phone: f.phone,
    lat: f.lat,
    lng: f.lng,
    distanceKm: +f.distanceKm.toFixed(1)
  }));
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Rule-based fallback helpers ──────────────────────────────────────────
function generateFallbackAnswer(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes('anjuna') || lower.includes('vagator')) return '🔴 DANGER: Anjuna and Vagator beaches have dangerous rip currents. No lifeguards. Do NOT swim Jun–Sep. Call Drishti Lifeguards: +91-832-2464333.';
  if (lower.includes('calangute') || lower.includes('baga')) return '🟡 CAUTION: Calangute/Baga have Drishti lifeguards but active rip currents near north end. Follow flag color. Red = no entry.';
  if (lower.includes('palolem') || lower.includes('agonda')) return '🟢 SAFE (relative): Palolem is Goa\'s safest beach — sheltered bay, calm waves. Exercise normal caution. No official lifeguards at Agonda.';
  if (lower.includes('dudhsagar')) return '🔴 DANGER: Dudhsagar approach is CLOSED Jun–Sep (flash floods, elephant corridor). Off-season only with certified guide before 8 AM.';
  if (lower.includes('ferry') || lower.includes('querim')) return 'Querim-Tiracol ferry runs every 30 min, 6AM–10PM. GSWTD: 0832-2224888. Panaji-Betim every 15 min, 6AM–11PM.';
  if (lower.includes('hospital') || lower.includes('medical') || lower.includes('ambulance')) return 'Call 108 for ambulance. GMC Bambolim: 0832-2458725 (Level 1 trauma, 24/7). Ponda Sub-District: 0832-2312225.';
  if (lower.includes('accident') || lower.includes('crash')) return '🚨 EMERGENCY: Call 112 (police) and 108 (ambulance) immediately. Do not move the victim unless in immediate danger. Share your GPS location.';
  if (lower.includes('nh4') || lower.includes('khandepar')) return '🔴 EXTREME DANGER: NH-4A Khandepar Ghats has zero mobile signal, blind bends, wildlife crossings. Never drive at night. Share route before entering.';
  return 'For all Goa emergencies: 112 (police/rescue), 108 (ambulance), 101 (fire), Drishti Lifeguards: +91-832-2464333, Coast Guard: 1554. Add GROQ_API_KEY in .env.local for full AI responses.';
}

function detectSafetyRating(q: string): 'safe' | 'caution' | 'danger' {
  const lower = q.toLowerCase();
  if (lower.includes('anjuna') || lower.includes('vagator') || lower.includes('dudhsagar') || lower.includes('accident') || lower.includes('emergency') || lower.includes('khandepar')) return 'danger';
  if (lower.includes('calangute') || lower.includes('road') || lower.includes('night') || lower.includes('monsoon') || lower.includes('ferry')) return 'caution';
  return 'caution';
}

function needsEmergency(q: string): boolean {
  return /accident|crash|drown|fire|bleeding|unconscious|emergency|help me/i.test(q);
}

function extractLocationCoords(q: string): { lat: number; lng: number } | null {
  const map: Record<string, { lat: number; lng: number }> = {
    anjuna: { lat: 15.5741, lng: 73.7407 }, vagator: { lat: 15.5985, lng: 73.7371 },
    calangute: { lat: 15.5439, lng: 73.7553 }, baga: { lat: 15.5569, lng: 73.7520 },
    palolem: { lat: 15.0100, lng: 74.0232 }, arambol: { lat: 15.6882, lng: 73.7048 },
    miramar: { lat: 15.4862, lng: 73.8078 }, colva: { lat: 15.2792, lng: 73.9227 },
    mapusa: { lat: 15.5917, lng: 73.8118 }, margao: { lat: 15.2736, lng: 73.9582 },
    panaji: { lat: 15.4965, lng: 73.8290 }, ponda: { lat: 15.4026, lng: 74.0152 },
    dudhsagar: { lat: 15.3139, lng: 74.3119 }, gmc: { lat: 15.4619, lng: 73.8560 },
    bambolim: { lat: 15.4619, lng: 73.8560 }, farmagudi: { lat: 15.4227, lng: 74.0089 },
    gec: { lat: 15.4227, lng: 74.0089 }, vasco: { lat: 15.3945, lng: 73.8120 },
    morjim: { lat: 15.6441, lng: 73.7236 }, agonda: { lat: 15.0467, lng: 73.9946 },
  };
  const lower = q.toLowerCase();
  for (const [key, coords] of Object.entries(map)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function generateTips(q: string): string[] {
  const lower = q.toLowerCase();
  if (lower.includes('beach') || lower.includes('swim') || lower.includes('sea')) {
    return ['Check flag color before entering water (Red = no entry)', 'Never swim alone, especially Jun–Sep', 'If caught in rip: swim parallel to shore, then angle back', 'Drishti Lifeguards: +91-832-2464333'];
  }
  if (lower.includes('road') || lower.includes('drive') || lower.includes('accident')) {
    return ['Call 108 ambulance immediately', 'Call 112 police', 'Do not move injured persons unless immediate danger', 'Share GPS location with rescuers'];
  }
  return ['Emergency: 112', 'Ambulance: 108', 'Fire: 101', 'Drishti Lifeguards: +91-832-2464333'];
}
