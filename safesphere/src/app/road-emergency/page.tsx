"use client";

import { useState, useEffect, useRef } from "react";
import {
  Siren, Camera, MapPin, Phone, Heart, Timer, ChevronRight,
  ArrowLeft, Navigation, Hospital, Shield, AlertTriangle,
  CheckCircle, Loader2, Zap
} from "lucide-react";
import Link from "next/link";

// Goa emergency contacts
const GOA_EMERGENCY = {
  police: { name: 'Goa Police (112)', phone: '112', color: 'blue' },
  ambulance: { name: 'Ambulance (108)', phone: '108', color: 'red' },
  fire: { name: 'Fire (101)', phone: '101', color: 'orange' },
  lifeguard: { name: 'Drishti Lifeguards', phone: '+918322464333', color: 'teal' },
};

// Nearest facilities (mock-real data for Goa)
const FACILITIES = [
  { id: 'gmc', name: 'Goa Medical College (GMC)', type: 'hospital', phone: '0832-2458725', distance: '18.2 km', eta: '22 min', lat: 15.4619, lng: 73.8560 },
  { id: 'ponda-hosp', name: 'Ponda Sub-District Hospital', type: 'hospital', phone: '0832-2312225', distance: '2.1 km', eta: '5 min', lat: 15.4060, lng: 74.0180 },
  { id: 'ponda-police', name: 'Ponda Police Station', type: 'police', phone: '0832-2312121', distance: '2.5 km', eta: '6 min', lat: 15.4010, lng: 74.0165 },
];

// First aid steps by situation
const FIRST_AID = {
  accident: [
    { step: 1, title: 'Ensure Scene Safety', desc: 'Do NOT move the victim unless immediate danger (fire/traffic). Warn other vehicles.', icon: '⚠️' },
    { step: 2, title: 'Call 108 Immediately', desc: 'Call ambulance first. Give exact location: road name, landmark, taluka.', icon: '📞' },
    { step: 3, title: 'Check Responsiveness', desc: 'Tap shoulders gently. Ask "Are you okay?" If no response — start CPR if trained.', icon: '👋' },
    { step: 4, title: 'Control Bleeding', desc: 'Apply firm pressure with clean cloth. Do NOT remove if cloth soaks — add more on top.', icon: '🩸' },
    { step: 5, title: 'Keep Warm & Calm', desc: 'Cover with jacket/blanket. Speak calmly. Do NOT give food or water if head/abdominal injury.', icon: '🧥' },
    { step: 6, title: 'Document & Assist Police', desc: 'Note vehicle numbers. Photograph scene (after victim secured). File FIR at nearest station.', icon: '📋' },
  ],
  medical: [
    { step: 1, title: 'Call 108 Ambulance', desc: 'Medical emergency — call first. Describe symptoms clearly: chest pain, unconscious, breathing difficulty.', icon: '🚑' },
    { step: 2, title: 'Recovery Position', desc: 'If unconscious but breathing: lay on side (recovery position) to prevent choking.', icon: '💙' },
    { step: 3, title: 'Start CPR if Needed', desc: 'If not breathing: 30 chest compressions (2 inches deep, 100/min pace) + 2 rescue breaths.', icon: '❤️' },
    { step: 4, title: 'Heat Stroke (Goa-specific)', desc: 'Move to shade. Pour cool water on neck/armpits. Fan. Call 108. DO NOT give cold water to drink.', icon: '🌡️' },
    { step: 5, title: 'Snake Bite (Goa-specific)', desc: 'Immobilize bitten limb. Keep below heart level. Do NOT cut/suck. Rush to GMC Bambolim immediately.', icon: '🐍' },
  ],
  drowning: [
    { step: 1, title: 'Call Drishti Lifeguards', desc: 'Call +91-832-2464333 immediately. Give beach name and victim description.', icon: '🏖️' },
    { step: 2, title: 'Do NOT Enter Water Untrained', desc: 'Panicked drowning victim can pull you under. Throw rope, floatation device, or reach with a pole.', icon: '⛔' },
    { step: 3, title: 'Rip Current (CRITICAL)', desc: 'If caught in rip: DO NOT fight it. Swim parallel to shore until free, then swim back diagonally.', icon: '🌊' },
    { step: 4, title: 'Once Victim Ashore', desc: 'Place face down. Clear airway. Start rescue breathing if not breathing. Call 108.', icon: '💨' },
  ],
  fire: [
    { step: 1, title: 'Evacuate & Call 101', desc: 'Get everyone out first. Call Goa Fire Services: 101. Never re-enter for belongings.', icon: '🔥' },
    { step: 2, title: 'Stop Drop Roll', desc: 'If clothes catch fire: STOP running, DROP to ground, ROLL to smother flames.', icon: '🛑' },
    { step: 3, title: 'Gas Cylinder Fire', desc: 'Turn off gas regulator if safe to reach. Move cylinder away from heat. Never cool with water.', icon: '🔴' },
    { step: 4, title: 'Burns Treatment', desc: 'Cool burn with room-temp running water for 10-20 min. DO NOT use ice, butter, or toothpaste.', icon: '💧' },
  ]
};

type SituationType = 'accident' | 'medical' | 'drowning' | 'fire';

export default function RoadEmergencyPage() {
  const [step, setStep] = useState<'choose' | 'active'>('choose');
  const [situation, setSituation] = useState<SituationType>('accident');
  const [goldenMinutes, setGoldenMinutes] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const launchSOS = (type: SituationType) => {
    setSituation(type);
    setStep('active');
    getLocation();
    if (type === 'accident' || type === 'medical') startGoldenHour();
    setSosTriggered(false);
    // Play siren sound
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
    } catch {}
  };

  const timerColor = goldenMinutes > 30 ? 'text-emerald-400' : goldenMinutes > 15 ? 'text-amber-400' : 'text-red-400';

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
          {/* Emergency call first */}
          <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-6 text-center space-y-3">
            <Siren className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-2xl font-extrabold text-white">Emergency?</h1>
            <p className="text-slate-400 text-sm">Call 112 immediately for any life-threatening situation.</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.values(GOA_EMERGENCY).map(em => (
                <a
                  key={em.phone}
                  href={`tel:${em.phone}`}
                  className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 hover:bg-slate-700/50 transition-all"
                >
                  <Phone className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-xs font-bold text-white truncate">{em.name}</div>
                    <div className="text-[10px] text-slate-400">{em.phone}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Choose situation */}
          <div>
            <h2 className="font-bold text-slate-300 text-sm mb-3 uppercase tracking-wider">What happened? Get guided first-aid steps:</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { type: 'accident' as const, label: 'Road Accident', icon: '🚗', desc: 'Collision, crash, injuries' },
                { type: 'medical' as const, label: 'Medical Emergency', icon: '❤️', desc: 'Chest pain, unconscious, seizure' },
                { type: 'drowning' as const, label: 'Drowning / Beach', icon: '🌊', desc: 'Rip current, drowning victim' },
                { type: 'fire' as const, label: 'Fire / Burns', icon: '🔥', desc: 'Fire, gas leak, burns' },
              ]).map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => launchSOS(type)}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-left hover:bg-slate-700/50 hover:border-red-500/30 transition-all group"
                >
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

          {/* Danger roads quick reference */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <p className="font-bold text-amber-300 text-sm mb-2">⚠️ High-Risk Roads in Goa (Known Accident Spots)</p>
            <ul className="space-y-1">
              {['NH-4A Khandepar Ghats — blind bends, no signal', 'Dudhsagar approach — closed Jun-Sep', 'Sanguem-Mollem — wildlife crossing, no lights', 'Calangute-Anjuna Night — speeding bikes'].map(r => (
                <li key={r} className="text-xs text-slate-400 flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="text-xs text-indigo-400 hover:underline mt-2 block">
              View all danger roads on map →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active emergency mode
  const steps = FIRST_AID[situation];
  const situationLabel = { accident: 'Road Accident', medical: 'Medical Emergency', drowning: 'Drowning / Beach', fire: 'Fire Emergency' }[situation];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Red alert header */}
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

        {/* Emergency call buttons — ALWAYS AT TOP */}
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

        {/* GPS Location */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1">
            {locating ? (
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-400" /><span className="text-sm text-slate-400">Getting your GPS location...</span></div>
            ) : location ? (
              <>
                <p className="text-sm font-bold text-white">GPS Locked ✅</p>
                <p className="text-xs text-slate-400">Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</p>
                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline"
                >Share location on Google Maps →</a>
              </>
            ) : (
              <button onClick={getLocation} className="text-sm text-blue-400 hover:underline">Get GPS Location</button>
            )}
          </div>
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

        {/* Nearest facilities */}
        <div>
          <h2 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-3">Nearest Emergency Facilities</h2>
          <div className="space-y-2">
            {FACILITIES.map(f => (
              <div key={f.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                {f.type === 'hospital' ? <Hospital className="w-4 h-4 text-red-400 shrink-0" /> : <Shield className="w-4 h-4 text-blue-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{f.distance} · ETA ~{f.eta}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a href={`tel:${f.phone}`} className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-2 hover:bg-red-500/30 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noreferrer" className="bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg p-2 hover:bg-blue-500/30 transition-colors">
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back */}
        <button onClick={() => setStep('choose')} className="w-full py-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors">
          ← Back to Emergency Selection
        </button>
      </div>
    </div>
  );
}
