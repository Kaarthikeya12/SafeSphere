import { NextResponse } from 'next/server';

// Grok AI query endpoint — uses xAI Grok API with Goa-specific context
export async function POST(req: Request) {
  try {
    const { query, lat, lng } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

    // Build Goa-specific system prompt
    const systemPrompt = `You are SafeSphere AI — a hyper-local safety assistant for Goa, India.
You have deep knowledge of:
- Goa geography: beaches (Calangute, Anjuna, Vagator, Arambol, Palolem, Colva, Benaulim, Miramar, etc.)
- Emergency contacts: Goa 112 (police/emergency), 108 (ambulance), 101 (fire), Drishti Lifeguards (+91-832-2464333)
- Known danger roads: NH-4A Khandepar Ghats, Dudhsagar approach, Sanguem-Mollem corridor
- Ferry crossings: Querim-Tiracol, Siolim-Chopdem, Panaji-Betim, Agassaim-Curca, Cavelossim-Assolna
- Goa seasons: Monsoon Jun-Sep (rough seas, landslides, ferry suspensions), Season Oct-May
- Hospitals: GMC Bambolim (0832-2458725), Ponda Sub-District (0832-2312225), South Goa District Margao (0832-2705664)
- Police: Panaji (0832-2224488), Calangute (0832-2277254), Margao (0832-2705020), Ponda (0832-2312121)
- Wildlife risks: Bhagwan Mahaveer Wildlife Sanctuary (leopards, bison), Mhadei Wildlife Sanctuary
- Sea hazards: rip currents (highest at Vagator, Anjuna, Querim, Calangute north), jellyfish in monsoon
- Cultural events: Shigmo festival, Carnival, Trance parties (Anjuna/Vagator)

Current user location: ${lat && lng ? `Lat ${lat}, Lng ${lng} (approximately in Goa)` : 'Unknown — user did not share GPS'}

RESPONSE RULES:
1. Be direct and concise — 3-5 sentences max unless a detailed step-by-step is needed
2. Always cite exact phone numbers when mentioning emergency services
3. Rate the safety with ONE of: 🟢 SAFE | 🟡 CAUTION | 🔴 DANGER
4. If life-threatening emergency: ALWAYS say "Call 112 NOW" as first line
5. Give GPS coordinates (lat, lng) of any specific location mentioned so the map can zoom there
6. Format response as JSON with fields: answer (string), safetyRating ('safe'|'caution'|'danger'), coordinates (null or {lat,lng}), emergencyNumber (null or string), tips (string[])`;

    if (!apiKey) {
      // Fallback rule-based response when no API key
      return NextResponse.json({
        answer: generateFallbackAnswer(query),
        safetyRating: detectSafetyRating(query),
        coordinates: extractLocationCoords(query),
        emergencyNumber: query.toLowerCase().includes('emergency') || query.toLowerCase().includes('accident') ? '112' : null,
        tips: generateTips(query),
        engine: 'rule-based'
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query.trim() }
        ],
        temperature: 0.3,
        max_tokens: 512,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Grok API error:', errText);
      // Graceful fallback
      return NextResponse.json({
        answer: generateFallbackAnswer(query),
        safetyRating: detectSafetyRating(query),
        coordinates: extractLocationCoords(query),
        emergencyNumber: null,
        tips: generateTips(query),
        engine: 'rule-based-fallback'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Grok');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { answer: content, safetyRating: 'caution', coordinates: null, emergencyNumber: null, tips: [] };
    }

    return NextResponse.json({ ...parsed, engine: 'grok-3-mini' });

  } catch (err) {
    console.error('AI query error:', err);
    return NextResponse.json({
      answer: 'Unable to reach AI right now. For emergencies call 112. For beach safety call Drishti Lifeguards: +91-832-2464333.',
      safetyRating: 'caution',
      coordinates: null,
      emergencyNumber: '112',
      tips: ['Call 112 for any emergency', 'Call 108 for ambulance', 'Drishti Lifeguards: +91-832-2464333'],
      engine: 'error-fallback'
    }, { status: 200 }); // Return 200 with fallback
  }
}

// ── Fallback helpers when no API key or API fails ──────────────────────────

function generateFallbackAnswer(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('anjuna') || q.includes('vagator')) {
    return '🔴 DANGER: Anjuna and Vagator beaches have dangerous rip currents, especially Jun–Sep. Swimming is NOT advised. No lifeguards on duty. Stay out of the water.';
  }
  if (q.includes('calangute') || q.includes('baga')) {
    return '🟡 CAUTION: Calangute and Baga beaches have Drishti lifeguards, but rip currents are active near the north end. Follow flag warnings. Red flag = do not enter water.';
  }
  if (q.includes('palolem') || q.includes('agonda')) {
    return '🟢 SAFE (Relative): Palolem and Agonda are among Goa\'s calmer beaches with a sheltered bay. Still exercise caution and check for flag status. No official lifeguards at Agonda.';
  }
  if (q.includes('ferry') || q.includes('querim') || q.includes('tiracol')) {
    return 'Querim–Tiracol ferry runs every 30 minutes, 6 AM – 10 PM. Fare: ₹3/person. Contact GSWTD: 0832-2224888. Can be delayed/suspended in heavy monsoon.';
  }
  if (q.includes('hospital') || q.includes('medical')) {
    return 'Nearest major hospital: Goa Medical College Bambolim (0832-2458725) — 24/7 trauma center. Ponda Sub-District Hospital (0832-2312225). For ambulance: call 108.';
  }
  if (q.includes('dudhsagar') || q.includes('waterfall')) {
    return '🔴 DANGER (Monsoon): Dudhsagar approach road is CLOSED Jun–Sep due to flash floods and washouts. Wildlife (elephants) present year-round. Only enter with certified guide before 8 AM in season.';
  }
  if (q.includes('road') || q.includes('drive') || q.includes('nh')) {
    return '🟡 CAUTION: NH-4A Khandepar Ghats has zero mobile signal, blind bends, and wildlife crossings. Avoid night driving. Always share your route before entering this stretch.';
  }
  return 'For all emergencies in Goa: call 112 (police/fire/rescue), 108 (ambulance), 101 (fire). Drishti Marine Lifeguards: +91-832-2464333. SafeSphere AI provides local guidance — not a replacement for official emergency services.';
}

function detectSafetyRating(query: string): 'safe' | 'caution' | 'danger' {
  const q = query.toLowerCase();
  if (q.includes('anjuna') || q.includes('vagator') || q.includes('dudhsagar') || q.includes('emergency') || q.includes('accident')) {
    return 'danger';
  }
  if (q.includes('calangute') || q.includes('road') || q.includes('night') || q.includes('monsoon')) {
    return 'caution';
  }
  if (q.includes('palolem') || q.includes('agonda') || q.includes('benaulim')) {
    return 'safe';
  }
  return 'caution';
}

function extractLocationCoords(query: string): { lat: number; lng: number } | null {
  const q = query.toLowerCase();
  const locationMap: Record<string, { lat: number; lng: number }> = {
    'anjuna': { lat: 15.5741, lng: 73.7407 },
    'vagator': { lat: 15.5985, lng: 73.7371 },
    'calangute': { lat: 15.5439, lng: 73.7553 },
    'baga': { lat: 15.5569, lng: 73.7520 },
    'palolem': { lat: 15.0100, lng: 74.0232 },
    'arambol': { lat: 15.6882, lng: 73.7048 },
    'miramar': { lat: 15.4862, lng: 73.8078 },
    'colva': { lat: 15.2792, lng: 73.9227 },
    'mapusa': { lat: 15.5917, lng: 73.8118 },
    'margao': { lat: 15.2736, lng: 73.9582 },
    'panaji': { lat: 15.4965, lng: 73.8290 },
    'ponda': { lat: 15.4026, lng: 74.0152 },
    'dudhsagar': { lat: 15.3139, lng: 74.3119 },
    'vasco': { lat: 15.3945, lng: 73.8120 },
    'morjim': { lat: 15.6441, lng: 73.7236 },
    'gmc': { lat: 15.4619, lng: 73.8560 },
    'bambolim': { lat: 15.4619, lng: 73.8560 },
    'farmagudi': { lat: 15.4227, lng: 74.0089 },
    'gec': { lat: 15.4227, lng: 74.0089 },
  };
  for (const [key, coords] of Object.entries(locationMap)) {
    if (q.includes(key)) return coords;
  }
  return null;
}

function generateTips(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('beach') || q.includes('swim')) {
    return [
      'Always check beach flag color before entering water',
      'Red flag = danger, Yellow = caution, Green = relatively safe',
      'Never swim alone, especially in monsoon',
      'Drishti Lifeguards: +91-832-2464333'
    ];
  }
  if (q.includes('road') || q.includes('drive')) {
    return [
      'Share your live location before long road trips',
      'Avoid night driving on Ghats sections',
      'Keep your fuel tank above half before entering forest roads',
      'Download offline Goa maps before entering no-signal zones'
    ];
  }
  return [
    'Emergency: 112 (all emergencies)',
    'Ambulance: 108',
    'Fire: 101',
    'Drishti Marine Lifeguards: +91-832-2464333'
  ];
}
