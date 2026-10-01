"use client";

import { useEffect, useState } from "react";
import { PhoneCall, Shield, X, User } from "lucide-react";
import { soundEngine } from "@/lib/sound";

interface FakeCallModalProps {
  open: boolean;
  onClose: () => void;
}

const CALLERS = [
  {
    name: "Dad (Home)",
    number: "+91 98221 00214",
    script: "Beta, where are you? I've reached outside the gate in the car. Headlights are on, come out now.",
  },
  {
    name: "Goa Police Patrol Unit 4",
    number: "112-GOA-PCR",
    script: "This is PCR Unit 4 on patrol duty near your junction. We are turning into your road in 30 seconds. Stay safe.",
  },
  {
    name: "Sanika (Hostel Roommate)",
    number: "+91 94033 12908",
    script: "Hey! We are waiting at the canteen entrance. We are walking towards your path right now, see you in two minutes!",
  },
];

export function FakeCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [callerIdx, setCallerIdx] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const caller = CALLERS[callerIdx];

  useEffect(() => {
    if (!open) {
      soundEngine.stopRingtone();
      soundEngine.stopSpeech();
      setIsAnswered(false);
      setCallDuration(0);
      return;
    }

    soundEngine.startRingtone();
    setIsAnswered(false);
    setCallDuration(0);

    return () => {
      soundEngine.stopRingtone();
      soundEngine.stopSpeech();
    };
  }, [open]);

  useEffect(() => {
    if (!isAnswered) return;
    const t = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [isAnswered]);

  function handleAnswer() {
    soundEngine.stopRingtone();
    setIsAnswered(true);
    soundEngine.speak(caller.script, 0.95);
  }

  function handleEnd() {
    soundEngine.stopRingtone();
    soundEngine.stopSpeech();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl flex flex-col justify-between min-h-[500px]">
        {/* Caller Picker (top bar) */}
        {!isAnswered && (
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Caller:</span>
            <div className="flex gap-1">
              {CALLERS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCallerIdx(i)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    callerIdx === i ? "bg-brand text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top Info */}
        <div className="text-center pt-4">
          <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
            {isAnswered ? "Call in progress" : "Incoming Emergency Call"}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">{caller.name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{caller.number}</p>
          {isAnswered && (
            <p className="mt-3 text-sm font-mono font-bold text-emerald-400">
              {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Center Visual */}
        <div className="my-8 flex flex-col items-center">
          <div
            className={`grid size-28 place-items-center rounded-full bg-slate-800 border-4 border-slate-700 text-slate-300 shadow-xl ${
              !isAnswered ? "animate-bounce" : "animate-pulse"
            }`}
          >
            <User size={48} />
          </div>
          {isAnswered && (
            <div className="mt-5 rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-300 text-center italic max-w-xs">
              "{caller.script}"
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pb-4">
          {!isAnswered ? (
            <div className="flex items-center justify-around">
              <button
                type="button"
                onClick={handleEnd}
                className="grid size-16 place-items-center rounded-full bg-danger text-white shadow-lg hover:bg-danger-600 transition"
                aria-label="Decline call"
              >
                <PhoneCall size={26} className="rotate-[135deg]" />
              </button>
              <button
                type="button"
                onClick={handleAnswer}
                className="grid size-16 place-items-center rounded-full bg-safe text-white shadow-lg hover:bg-emerald-600 transition animate-pulse"
                aria-label="Answer call"
              >
                <PhoneCall size={26} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleEnd}
                className="grid size-16 place-items-center rounded-full bg-danger text-white shadow-lg hover:bg-danger-600 transition"
                aria-label="End call"
              >
                <PhoneCall size={26} className="rotate-[135deg]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
