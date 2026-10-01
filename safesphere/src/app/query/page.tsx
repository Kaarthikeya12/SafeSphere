"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, MapPin, Phone, AlertTriangle, Shield, Send,
  Loader2, Navigation, ChevronRight, Waves, Car, Anchor,
  Siren, Camera, X, Image, Hospital, Upload, Zap
} from "lucide-react";
import Link from "next/link";

interface NearbyFacility {
  name: string;
  type: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

interface AIResponse {
  answer: string;
  safetyRating: 'safe' | 'caution' | 'danger';
  coordinates: { lat: number; lng: number } | null;
  emergencyNumber: string | null;
  tips: string[];
  nearbyFacilities?: NearbyFacility[];
  engine: string;
  mode?: string;
  detectedSituation?: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  imagePreview?: string;
  response?: AIResponse;
  timestamp: number;
}

const QUICK_QUERIES = [
  { icon: Waves, text: "Is Anjuna beach safe today?", category: "beach" },
  { icon: Car, text: "Road to Dudhsagar safe in monsoon?", category: "road" },
  { icon: Anchor, text: "Is Querim ferry running now?", category: "ferry" },
  { icon: MapPin, text: "Nearest hospital from Mapusa?", category: "medical" },
  { icon: Shield, text: "Safe beaches for swimming right now?", category: "beach" },
  { icon: AlertTriangle, text: "Is NH-4A Khandepar Ghats safe at night?", category: "road" },
  { icon: Waves, text: "Calangute beach rip current warning?", category: "beach" },
  { icon: Navigation, text: "Emergency contacts for South Goa?", category: "emergency" },
];

const RATING_CONFIG = {
  safe: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: '🟢 SAFE', from: 'from-emerald-950/40' },
  caution: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: '🟡 CAUTION', from: 'from-amber-950/40' },
  danger: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: '🔴 DANGER', from: 'from-red-950/40' },
};

const FACILITY_ICON: Record<string, string> = {
  hospital: '🏥', police: '🚔', lifeguard: '🏖️', fire: '🚒'
};

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingImage, setPendingImage] = useState<{ base64: string; preview: string; type: string } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'got' | 'denied'>('idle');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-get GPS on load
  useEffect(() => {
    setLocationStatus('getting');
    navigator.geolocation?.getCurrentPosition(
      p => {
        setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocationStatus('got');
      },
      () => setLocationStatus('denied'),
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Convert file to base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setPendingImage({ base64, preview: result, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const sendQuery = async (text: string, imageData?: { base64: string; preview: string; type: string }) => {
    const trimmed = text.trim();
    if ((!trimmed && !imageData) || loading) return;

    const img = imageData || pendingImage;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed || (img ? '📸 Photo uploaded — analyze this emergency situation' : ''),
      imagePreview: img?.preview,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setPendingImage(null);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { query: trimmed };
      if (userLocation) { payload.lat = userLocation.lat; payload.lng = userLocation.lng; }
      if (img) { payload.imageBase64 = img.base64; payload.imageType = img.type; }

      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data: AIResponse = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.answer,
        response: data,
        timestamp: Date.now()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '⚠️ Connection error. For emergencies: CALL 112 immediately.',
        response: { answer: '', safetyRating: 'danger', coordinates: null, emergencyNumber: '112', tips: ['Call 112 NOW'], engine: 'error' },
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuery(query); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              ← Dashboard
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">SafeSphere AI</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-medium flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Groq
              </span>
            </div>
          </div>
          {/* GPS status */}
          <div className="flex items-center gap-1.5 text-xs">
            {locationStatus === 'got' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GPS active
              </span>
            ) : locationStatus === 'getting' ? (
              <span className="text-slate-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Getting GPS...
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> No GPS
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-4 overflow-auto">

        {/* Empty state with quick queries */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Ask SafeSphere AI</h1>
              <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                Powered by <strong className="text-violet-300">Groq llama-3.3-70b</strong> with deep Goa safety knowledge.
                Ask anything — or upload an accident photo for instant analysis.
              </p>
            </div>

            {/* Photo upload CTA */}
            <div className="flex gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-2xl px-4 py-2.5 text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
              >
                <Camera className="w-4 h-4" />
                📸 Take Accident Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
            </div>

            <p className="text-xs text-slate-500 -mt-2 text-center">
              📸 Photo upload = AI identifies the emergency type + shows nearest hospital/police
            </p>

            {/* Quick queries */}
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Or ask:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_QUERIES.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => sendQuery(q.text)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-left group"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-violet-400 shrink-0 transition-colors" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{q.text}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[80%] space-y-2">
                {msg.imagePreview && (
                  <div className="rounded-2xl overflow-hidden border border-indigo-500/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.imagePreview} alt="Uploaded" className="max-h-48 w-full object-cover" />
                  </div>
                )}
                {msg.content && (
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-lg">
                    {msg.content}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[92%] w-full space-y-2">
                {/* Rating badge */}
                {msg.response?.safetyRating && (
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${RATING_CONFIG[msg.response.safetyRating].color}`}>
                    {RATING_CONFIG[msg.response.safetyRating].label}
                    {msg.response.mode === 'photo' && <span className="ml-1 opacity-70">· Photo Analysis</span>}
                  </div>
                )}

                {/* Answer bubble */}
                <div className={`bg-gradient-to-b ${msg.response ? RATING_CONFIG[msg.response.safetyRating].from : 'from-slate-800/40'} to-slate-800/30 border border-slate-700/50 rounded-2xl rounded-tl-sm p-4 shadow-lg space-y-3`}>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Emergency CTA */}
                  {msg.response?.emergencyNumber && (
                    <a
                      href={`tel:${msg.response.emergencyNumber}`}
                      className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-3 hover:bg-red-500/30 transition-colors"
                    >
                      <Siren className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 font-bold text-sm">📞 Call {msg.response.emergencyNumber} NOW</span>
                    </a>
                  )}

                  {/* Nearest facilities — GPS powered */}
                  {msg.response?.nearbyFacilities && msg.response.nearbyFacilities.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/40 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-violet-400" />
                        {locationStatus === 'got' ? 'Nearest from your GPS' : 'Nearby facilities'}
                      </p>
                      {msg.response.nearbyFacilities.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900/50 rounded-xl p-2.5">
                          <span className="text-base">{FACILITY_ICON[f.type] || '📍'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{f.name}</p>
                            {f.distanceKm && <p className="text-[10px] text-slate-500">{f.distanceKm} km away</p>}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <a href={`tel:${f.phone}`} className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-1.5 hover:bg-red-500/30 transition-colors">
                              <Phone className="w-3 h-3" />
                            </a>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noreferrer"
                              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg p-1.5 hover:bg-blue-500/30 transition-colors">
                              <Navigation className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {msg.response?.tips && msg.response.tips.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/40 space-y-1.5">
                      {msg.response.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-violet-400 mt-0.5 shrink-0">•</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Map link */}
                  {msg.response?.coordinates && (
                    <a href={`https://www.google.com/maps?q=${msg.response.coordinates.lat},${msg.response.coordinates.lng}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors pt-1">
                      <Navigation className="w-3 h-3" />
                      Open location in Google Maps
                    </a>
                  )}

                  {/* Engine badge */}
                  <div className="text-[10px] text-slate-600">
                    {msg.response?.engine?.includes('groq') ? '⚡ Groq AI' : '🔧 Rule-based'} · {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-slate-400 text-sm">
                {pendingImage ? 'Analyzing photo with Groq Vision AI...' : 'Asking Groq with Goa safety data...'}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto space-y-2">

          {/* Pending image preview */}
          {pendingImage && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.preview} alt="Pending" className="h-20 w-auto rounded-xl border border-violet-500/40 object-cover" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] rounded px-1 py-0.5">AI will analyze this</div>
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 items-end">
            {/* Camera / Upload buttons */}
            <div className="flex gap-1.5 pb-1">
              <button
                onClick={() => cameraInputRef.current?.click()}
                title="Take photo (accident/emergency)"
                className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-red-500/20 hover:border-red-500/40 flex items-center justify-center transition-all text-slate-400 hover:text-red-400"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo from gallery"
                className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-indigo-500/20 hover:border-indigo-500/40 flex items-center justify-center transition-all text-slate-400 hover:text-indigo-400"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingImage ? "Describe what happened (optional)..." : "Ask about beach, road, ferry, hospital, emergency in Goa..."}
                rows={1}
                style={{ resize: 'none' }}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <button
              onClick={() => sendQuery(query)}
              disabled={(!query.trim() && !pendingImage) || loading}
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-violet-500/25 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600">
            📸 Upload accident photo → AI identifies emergency + shows nearest hospital/police •
            Not an emergency service • Call <a href="tel:112" className="text-red-400 font-bold">112</a> for life-threatening situations
          </p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
