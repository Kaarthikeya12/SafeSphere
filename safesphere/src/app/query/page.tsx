"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, MapPin, Phone, AlertTriangle, Shield, Send,
  Loader2, Navigation, ChevronRight, Waves, Car, Anchor, Siren
} from "lucide-react";
import Link from "next/link";

interface AIResponse {
  answer: string;
  safetyRating: 'safe' | 'caution' | 'danger';
  coordinates: { lat: number; lng: number } | null;
  emergencyNumber: string | null;
  tips: string[];
  engine: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
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

const ratingConfig = {
  safe: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: '🟢 SAFE', bg: 'from-emerald-950/50' },
  caution: { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: '🟡 CAUTION', bg: 'from-amber-950/50' },
  danger: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: '🔴 DANGER', bg: 'from-red-950/50' },
};

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(p => {
      setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, ...userLocation })
      });
      const data: AIResponse = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.answer,
        response: data,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Connection error. For emergencies: call 112 immediately.',
        response: { answer: '', safetyRating: 'danger', coordinates: null, emergencyNumber: '112', tips: ['Call 112 for all emergencies'], engine: 'error' },
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(query);
    }
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
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-medium">Goa-specific</span>
            </div>
          </div>
          {userLocation && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS active
            </span>
          )}
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-4 overflow-auto">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Ask SafeSphere AI</h1>
              <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                Goa-specific safety intelligence. Ask about beaches, roads, ferries, hospitals, or any emergency situation.
              </p>
            </div>

            {/* Quick queries */}
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Try asking</p>
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
              <div className="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-lg">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] w-full space-y-2">
                {/* Safety rating badge */}
                {msg.response?.safetyRating && (
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${ratingConfig[msg.response.safetyRating].color}`}>
                    {ratingConfig[msg.response.safetyRating].label}
                  </div>
                )}

                {/* Main answer */}
                <div className={`bg-gradient-to-b ${msg.response ? ratingConfig[msg.response.safetyRating].bg : 'from-slate-800/50'} to-slate-800/40 border border-slate-700/50 rounded-2xl rounded-tl-sm p-4 shadow-lg`}>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Emergency number highlight */}
                  {msg.response?.emergencyNumber && (
                    <a
                      href={`tel:${msg.response.emergencyNumber}`}
                      className="mt-3 flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-3 hover:bg-red-500/30 transition-colors"
                    >
                      <Siren className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 font-bold text-sm">Call {msg.response.emergencyNumber} NOW</span>
                    </a>
                  )}

                  {/* Tips */}
                  {msg.response?.tips && msg.response.tips.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                      {msg.response.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="text-violet-400 mt-0.5">•</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Map link if coordinates returned */}
                  {msg.response?.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${msg.response.coordinates.lat},${msg.response.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Navigation className="w-3 h-3" />
                      Open in Google Maps
                    </a>
                  )}

                  {/* Engine badge */}
                  <div className="mt-2 text-[10px] text-slate-600">
                    {msg.response?.engine === 'grok-3-mini' ? '⚡ Grok AI' : '🔧 Rule-based'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-slate-400 text-sm">Analyzing with Goa safety data...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about beach safety, roads, ferries, hospitals in Goa..."
                rows={1}
                style={{ resize: 'none' }}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-600">
                ↵ Send
              </div>
            </div>
            <button
              onClick={() => sendQuery(query)}
              disabled={!query.trim() || loading}
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-violet-500/25 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            SafeSphere AI is not an emergency service. For life-threatening emergencies, call <a href="tel:112" className="text-red-400 font-bold">112</a> immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
