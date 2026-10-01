"use client";

import { useState, useEffect, useRef } from "react";
import {
  Siren, Camera, MapPin, Phone, Timer, ChevronRight,
  ArrowLeft, Navigation, Hospital, Shield,
  Loader2, Upload, X, Sparkles, AlertTriangle
} from "lucide-react";
import Link from "next/link";

const GOA_EMERGENCY = {
  police: { name: 'Goa Police (112)', phone: '112' },
  ambulance: { name: 'Ambulance (108)', phone: '108' },
  fire: { name: 'Fire (101)', phone: '101' },
  lifeguard: { name: 'Drishti Lifeguards', phone: '+918322464333' },
};

const FACILITIES = [
  { id: 'gmc', name: 'Goa Medical College (GMC)', type: 'hospital', phone: '0832-2458725', lat: 15.4619, lng: 73.8560 },
  { id: 'ponda-hosp', name: 'Ponda Sub-District Hospital', type: 'hospital', phone: '0832-2312225', lat: 15.4060, lng: 74.0180 },
  { id: 'ponda-police', name: 'Ponda Police Station', type: 'police', phone: '0832-2312121', lat: 15.4010, lng: 74.0165 },
];

const FIRST_AID = {
  accident: [
    { step: 1, title: 'Ensure Scene Safety', desc: 'Do NOT move the victim unless immediate danger (fire/traffic). Warn other vehicles.', icon: '⚠️' },
    { step: 2, title: 'Call 108 Immediately', desc: 'Call ambulance first. Give exact location: road name, landmark, taluka.', icon: '📞' },
    { step: 3, title: 'Check Responsiveness', desc: 'Tap shoulders gently. Ask "Are you okay?" If no response — start CPR if trained.', icon: '👋' },
    { step: 4, title: 'Control Bleeding', desc: 'Apply firm pressure with clean cloth. Do NOT remove if cloth soaks — add more on top.', icon: '🩸' },
    { step: 5, title: 'Keep Warm & Calm', desc: 'Cover with jacket/blanket. Speak calmly. Do NOT give food/water if head/abdominal injury.', icon: '🧥' },
    { step: 6, title: 'Document & Assist Police', desc: 'Note vehicle numbers. Photograph scene (after victim secured). File FIR at nearest station.', icon: '📋' },
  ],
  medical: [
    { step: 1, title: 'Call 108 Ambulance', desc: 'Call first. Describe symptoms: chest pain, unconscious, breathing difficulty.', icon: '🚑' },
    { step: 2, title: 'Recovery Position', desc: 'If unconscious but breathing: lay on side to prevent choking.', icon: '💙' },
    { step: 3, title: 'CPR if Needed', desc: '30 chest compressions (2 inches deep, 100/min) + 2 rescue breaths.', icon: '❤️' },
    { step: 4, title: 'Heat Stroke (Goa)', desc: 'Move to shade. Cool water on neck/armpits. Fan. Do NOT give cold water.', icon: '🌡️' },
    { step: 5, title: 'Snake Bite (Goa)', desc: 'Immobilize limb below heart. Do NOT cut/suck. Rush to GMC Bambolim immediately.', icon: '🐍' },
  ],
  drowning: [
    { step: 1, title: 'Call Drishti Lifeguards', desc: 'Call +91-832-2464333 immediately. Give beach name and victim description.', icon: '🏖️' },
    { step: 2, title: 'Do NOT Enter Water Untrained', desc: 'Throw rope, floatation device, or reach with pole. Panicked victim can pull you under.', icon: '⛔' },
    { step: 3, title: 'Rip Current CRITICAL', desc: 'If caught in rip: do NOT fight it. Swim parallel to shore, then angle back.', icon: '🌊' },
    { step: 4, title: 'Victim Ashore', desc: 'Face down. Clear airway. Rescue breathing if not breathing. Call 108.', icon: '💨' },
  ],
  fire: [
    { step: 1, title: 'Evacuate & Call 101', desc: 'Get everyone out first. Call Goa Fire: 101. Never re-enter for belongings.', icon: '🔥' },
    { step: 2, title: 'Stop Drop Roll', desc: 'Clothes on fire: STOP, DROP to ground, ROLL to smother flames.', icon: '🛑' },
    { step: 3, title: 'Gas Cylinder', desc: 'Turn off regulator if safe. Move away from heat. Never cool with water.', icon: '🔴' },
    { step: 4, title: 'Burns', desc: 'Cool with room-temp running water 10-20 min. NO ice, butter, or toothpaste.', icon: '💧' },
  ],
};

type SituationType = 'accident' | 'medical' | 'drowning' | 'fire';

interface AIAnalysis {
  answer: string;
  safetyRating: string;
  emergencyNumber: string | null;
  tips: string[];
  nearbyFacilities?: Array<{ name: string; type: string; phone: string; lat: number; lng: number; distanceKm?: number }>;
  detectedSituation?: string;
}

export default function RoadEmergencyPage() {
  const [step, setStep] = useState<'choose' | 'active'>('choose');
  const [situation, setSituation] = useState<SituationType>('accident');
  const [goldenMinutes, setGoldenMinutes] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoType] = useState<string>('image/jpeg');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startGoldenHour = () => {
    setTimerActive(true);
    setGoldenMinutes(60);
    timerRef.current = setInterval(() => {
      setGoldenMinutes(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 60000);
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      p => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => { setLocation({ lat: 15.4227, lng: 74.0089 }); setLocating(false); }
    );
  };

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const processPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPhotoPreview(result);
      const b64 = result.split(',')[1];
      setPhotoBase64(b64);
      analyzePhoto(b64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async (base64: string, imgType: string) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const payload: Record<string, unknown> = {
        query: 'Emergency photo — analyze what happened, severity, and immediate actions needed',
        imageBase64: base64,
        imageType: imgType,
      };
      if (location) { payload.lat = location.lat; payload.lng = location.lng; }
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch {
      setAiAnalysis({ answer: 'AI unavailable. Call 112 immediately.', safetyRating: 'danger', emergencyNumber: '112', tips: [] });
    } finally {
      setAiLoading(false);
    }
  };

  const launchSOS = (type: SituationType) => {
    setSituation(type);
    setStep('active');
    getLocation();
    if (type === 'accident' || type === 'medical') startGoldenHour();
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } catch { /* silent */ }
  };

  const timerColor = goldenMinutes > 30 ? 'text-emerald-400' : goldenMinutes > 15 ? 'text-amber-400' : 'text-red-400';

  // ── CHOOSE SCREEN ─────────────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-900 text-white">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Siren className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">Emergency Response</span>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Emergency contacts */}
          <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-6 text-center space-y-3">
            <Siren className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-2xl font-extrabold text-white">Emergency?</h1>
            <p className="text-slate-400 text-sm">Call 112 immediately for any life-threatening situation.</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.values(GOA_EMERGENCY).map(em => (
                <a key={em.phone} href={`tel:${em.phone}`}
                  className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 hover:bg-slate-700/50 transition-all">
                  <Phone className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white truncate">{em.name}</div>
                    <div className="text-[10px] text-slate-400">{em.phone}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Photo upload shortcut */}
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-violet-300 text-sm">Groq AI Photo Analysis</p>
              <p className="text-xs text-slate-400 mt-0.5">Take a photo of the accident → AI instantly analyzes severity and shows nearest hospital/police</p>
              <button onClick={() => { launchSOS('accident'); setTimeout(() => cameraRef.current?.click(), 500); }}
                className="mt-2 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                <Camera className="w-3.5 h-3.5" /> Take Photo Now →
              </button>
            </div>
          </div>

          {/* Situation selector */}
          <div>
            <h2 className="font-bold text-slate-300 text-sm mb-3 uppercase tracking-wider">What happened? Get guided first-aid:</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: 'accident' as const, label: 'Road Accident', icon: '🚗', desc: 'Collision, crash, injuries' },
                { type: 'medical' as const, label: 'Medical Emergency', icon: '❤️', desc: 'Chest pain, unconscious, seizure' },
                { type: 'drowning' as const, label: 'Drowning / Beach', icon: '🌊', desc: 'Rip current, drowning victim' },
                { type: 'fire' as const, label: 'Fire / Burns', icon: '🔥', desc: 'Fire, gas leak, burns' },
              ]).map(({ type, label, icon, desc }) => (
                <button key={type} onClick={() => launchSOS(type)}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-left hover:bg-slate-700/50 hover:border-red-500/30 transition-all group">
                  <span className="text-3xl">{icon}</span>
                  <p className="font-bold text-white text-sm mt-2">{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-2 font-semibold group-hover:gap-2 transition-all">
                    Get steps <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Danger roads info */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <p className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> High-Risk Roads (Goa)</p>
            {['NH-4A Khandepar Ghats — blind bends, zero signal', 'Dudhsagar approach — closed Jun-Sep (flash floods)', 'Sanguem-Mollem — wildlife crossing, no lights', 'Calangute-Anjuna Night — speeding bikes, no lighting'].map(r => (
              <div key={r} className="text-xs text-slate-400 flex items-start gap-1.5 mb-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />{r}
              </div>
            ))}
            <Link href="/dashboard" className="text-xs text-indigo-400 hover:underline mt-2 block">View all on map →</Link>
          </div>
        </div>

        {/* Hidden inputs needed even on choose screen for the shortcut */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setStep('active'); setSituation('accident'); getLocation(); processPhoto(f); }}} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setStep('active'); setSituation('accident'); getLocation(); processPhoto(f); }}} />
      </div>
    );
  }

  // ── ACTIVE EMERGENCY SCREEN ───────────────────────────────────────────────
  const steps = FIRST_AID[situation];
  const situationLabel = { accident: 'Road Accident', medical: 'Medical Emergency', drowning: 'Drowning / Beach', fire: 'Fire Emergency' }[situation];
  const facilitiesFromAI = aiAnalysis?.nearbyFacilities ?? FACILITIES.map(f => ({ ...f, distanceKm: undefined }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-red-600 py-2 px-4 text-center">
        <p className="text-white text-xs font-bold animate-pulse">⚡ EMERGENCY MODE ACTIVE — {situationLabel.toUpperCase()}</p>
      </div>

      <header className="border-b border-red-900/40 bg-red-950/30 backdrop-blur sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => setStep('choose')} className="text-slate-400 hover:text-white text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {timerActive && (
            <div className={`font-bold text-sm flex items-center gap-2 ${timerColor}`}>
              <Timer className="w-4 h-4" />
              Golden Hour: {goldenMinutes}min
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Emergency calls */}
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:112" className="bg-red-600 hover:bg-red-500 rounded-2xl p-4 flex items-center gap-2 transition-colors">
            <Phone className="w-5 h-5 text-white" />
            <div><div className="font-extrabold text-white">CALL 112</div><div className="text-red-200 text-[10px]">Police/Emergency</div></div>
          </a>
          <a href="tel:108" className="bg-rose-700 hover:bg-rose-600 rounded-2xl p-4 flex items-center gap-2 transition-colors">
            <Hospital className="w-5 h-5 text-white" />
            <div><div className="font-extrabold text-white">CALL 108</div><div className="text-red-200 text-[10px]">Ambulance</div></div>
          </a>
        </div>

        {/* GPS */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1">
            {locating ? (
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Getting GPS...</span></div>
            ) : location ? (
              <>
                <p className="text-sm font-bold text-white">GPS Locked ✅</p>
                <p className="text-xs text-slate-400">Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</p>
                <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Share on Google Maps →</a>
              </>
            ) : (
              <button onClick={getLocation} className="text-sm text-blue-400 hover:underline">Get GPS Location</button>
            )}
          </div>
        </div>

        {/* GROQ AI PHOTO ANALYSIS */}
        <div className="bg-slate-800/40 border border-violet-500/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-bold text-white">Groq AI Photo Analysis</p>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5">Vision</span>
          </div>
          <p className="text-xs text-slate-400">Take or upload a photo — AI identifies the emergency and shows nearest hospital/police from your GPS.</p>

          <div className="flex gap-2">
            <button onClick={() => cameraRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-500 text-white rounded-xl py-2.5 text-xs font-bold transition-all border border-red-500/30">
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700/60 hover:bg-slate-600 text-slate-300 rounded-xl py-2.5 text-xs font-bold transition-all border border-slate-600/40">
              <Upload className="w-4 h-4" /> Gallery
            </button>
          </div>

          {photoPreview && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Emergency" className="w-full max-h-48 object-cover rounded-xl border border-slate-600/40" />
              <button onClick={() => { setPhotoPreview(null); setPhotoBase64(null); setAiAnalysis(null); }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-sm text-violet-300">Groq Vision AI analyzing emergency photo...</span>
            </div>
          )}

          {aiAnalysis && !aiLoading && (
            <div className={`rounded-xl p-3 border space-y-2 ${aiAnalysis.safetyRating === 'danger' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className={`text-xs font-bold ${aiAnalysis.safetyRating === 'danger' ? 'text-red-300' : 'text-amber-300'}`}>
                {aiAnalysis.safetyRating === 'danger' ? '🔴 DANGER' : '🟡 CAUTION'}
                {aiAnalysis.detectedSituation && (
                  <span className="ml-2 opacity-70 font-normal capitalize">{aiAnalysis.detectedSituation.replace(/_/g, ' ')}</span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.answer}</p>
              {aiAnalysis.emergencyNumber && (
                <a href={`tel:${aiAnalysis.emergencyNumber}`} className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg p-2.5 hover:bg-red-500/30 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300 font-bold text-xs">CALL {aiAnalysis.emergencyNumber} NOW</span>
                </a>
              )}
              {aiAnalysis.tips.map((t, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="text-violet-400 shrink-0">•</span>{t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* First Aid Steps */}
        <div>
          <h2 className="font-bold text-red-300 text-sm uppercase tracking-wider mb-3">
            🚨 First Aid — {situationLabel}
          </h2>
          <div className="space-y-2">
            {steps.map((s) => (
              <div key={s.step} className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 flex gap-3">
                <div className="text-2xl">{s.icon}</div>
                <div>
                  <div className="font-bold text-white text-sm">{s.step}. {s.title}</div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearest Facilities */}
        <div>
          <h2 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            Nearest Emergency Facilities
            {aiAnalysis?.nearbyFacilities && (
              <span className="text-[10px] text-violet-400 font-normal">· GPS-computed by AI</span>
            )}
          </h2>
          <div className="space-y-2">
            {facilitiesFromAI.map((f, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                {f.type === 'hospital' ? <Hospital className="w-4 h-4 text-red-400 shrink-0" /> : <Shield className="w-4 h-4 text-blue-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.distanceKm ? `${f.distanceKm} km away` : 'Goa, India'}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a href={`tel:${f.phone}`} className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-2 hover:bg-red-500/30 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noreferrer"
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg p-2 hover:bg-blue-500/30 transition-colors">
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setStep('choose')} className="w-full py-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
          Back to Emergency Selection
        </button>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) processPhoto(f); }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) processPhoto(f); }} />
    </div>
  );
}
