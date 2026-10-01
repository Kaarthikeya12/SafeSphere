import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  EyeOff,
  FileWarning,
  Lock,
  MapPinned,
  Phone,
  ScanText,
  Scale,
  Settings2,
  ShieldAlert,
  Siren,
  Sparkles,
  Timer,
  TriangleAlert,
  Users,
  Hospital,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";

const FEATURES = [
  { icon: Siren, title: "SOS", text: "Confirm, then call 112 and share a ready message with your location.", tone: "danger" },
  { icon: MapPinned, title: "Location sharing", text: "Live GPS with accuracy, and a clear stop button." },
  { icon: Users, title: "Trusted contacts", text: "One tap to call or text the people you trust." },
  { icon: Timer, title: "Safety check-ins", text: "A timer for the walk home. Tap “I’m safe” when you arrive." },
  { icon: FileWarning, title: "Incident reports", text: "Log hazards with time and optional location." },
  { icon: Hospital, title: "Nearby help", text: "Hospitals, police and fire stations from OpenStreetMap." },
  { icon: BookOpenCheck, title: "Preparedness", text: "Offline steps for fires, floods, accidents and more." },
  { icon: ScanText, title: "AI incident assist", text: "Suggested category and summary that you review and correct." },
] as const;

const STEPS = [
  { icon: Settings2, title: "Set up", text: "Create an account and add trusted contacts." },
  { icon: Siren, title: "Use when needed", text: "SOS, live location or a check-in — each one tap away." },
  { icon: BookOpenCheck, title: "Review & prepare", text: "Track your reports and read guidance for each hazard." },
];

const PRINCIPLES = [
  { icon: Sparkles, title: "AI assists, you decide", text: "Suggestions only. SOS and calling never wait for AI." },
  { icon: Scale, title: "Honest labels", text: "Every suggestion shows its source, confidence and uncertainty." },
  { icon: EyeOff, title: "Minimal data", text: "Location is read only when you ask, and stops when you say so." },
  { icon: Lock, title: "Private by default", text: "Your contacts and reports are visible only to you." },
];

function HeroPreview() {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_20%,#dfe8ff_0%,transparent_70%)]" />
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
            <span className="size-2.5 rounded-full bg-line-strong" />
          </div>
          <span className="text-[11px] font-medium text-muted">Illustrative preview</span>
        </div>
        <div className="grid gap-3 bg-surface p-4 sm:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand">
                <Timer size={18} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-ink">Check-in · walking home</p>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-2">
                  <div className="h-1.5 w-3/5 rounded-full bg-brand" />
                </div>
              </div>
              <span className="text-lg font-bold text-ink tabular-nums">09:42</span>
            </div>
            <div className="relative h-36 overflow-hidden rounded-xl border border-line bg-[#eef3f8]">
              <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <path d="M0 95 C60 80 90 120 150 100 S250 60 300 75" stroke="#ffffff" strokeWidth="10" fill="none" />
                <path d="M120 0 L135 150" stroke="#ffffff" strokeWidth="8" />
                <path d="M0 30 L300 45" stroke="#ffffff" strokeWidth="5" />
                <rect x="190" y="95" width="60" height="40" rx="4" fill="#dbe8d4" />
                <rect x="20" y="40" width="70" height="35" rx="4" fill="#e3e7ee" />
              </svg>
              <span className="absolute top-[52%] left-[45%] grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand/15">
                <span className="size-3.5 rounded-full border-2 border-white bg-brand shadow" />
              </span>
              <span className="absolute top-[22%] left-[72%] grid size-6 place-items-center rounded-full border-2 border-white bg-ink text-white shadow">
                <Hospital size={12} />
              </span>
              <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-body">Live · ±12 m</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-danger-100 bg-white p-3">
              <p className="text-[11px] font-semibold tracking-wider text-danger uppercase">Emergency</p>
              <div className="mt-2 grid h-20 place-items-center rounded-xl bg-danger text-white">
                <span className="flex items-center gap-2 text-lg font-extrabold tracking-[0.2em]">
                  <Siren size={20} /> SOS
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-white p-3">
              <p className="text-xs font-semibold text-ink">“Water rising near the bus stand”</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip bg-brand-50 text-brand">Flooding</span>
                <span className="chip bg-warn-50 text-warn">Unverified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="overflow-hidden border-b border-line">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-24">
            <div>
              <p className="chip border border-brand-100 bg-brand-50 text-brand">Safety · Disaster preparedness · Community resilience</p>
              <h1 className="mt-5 text-[2.6rem] leading-[1.05] font-extrabold sm:text-6xl">Safety, within reach.</h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-body">
                Personal safety tools and community incident awareness, together in one calm dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn btn-primary h-12 px-6 text-base">
                  Get started <ArrowRight size={18} aria-hidden />
                </Link>
                <a href="#features" className="btn btn-secondary h-12 px-6 text-base">
                  Explore features
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Phone size={16} className="shrink-0 text-danger" aria-hidden />
                In an emergency, call{" "}
                <a href="tel:112" className="font-semibold text-danger underline underline-offset-2">
                  112
                </a>
                <span>— SafeSphere is not an emergency service.</span>
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-16 border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="kicker">Features</p>
            <h2 className="mt-2 max-w-xl text-3xl font-bold sm:text-4xl">Everything you need in the first minutes.</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                const danger = "tone" in feature;
                return (
                  <div key={feature.title} className="card transition-shadow hover:shadow-md">
                    <span className={`grid size-10 place-items-center rounded-xl ${danger ? "bg-danger-50 text-danger" : "bg-brand-50 text-brand"}`}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed">{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="kicker">How it works</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Three steps.</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative rounded-2xl border border-line p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">{index + 1}</span>
                    <Icon size={20} className="text-brand" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Community resilience */}
        <section id="community" className="scroll-mt-16 border-b border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="kicker">Community safety</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Local hazards, clearly labelled.</h2>
              <p className="mt-4 max-w-lg text-body">
                Opt in to share a report anonymously so neighbours can see open drains, flooding or unsafe spots nearby.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Shared reports hide your name and round location to ~1 km",
                  "AI suggests a category; you confirm it",
                  "Guidance links to each hazard type",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-safe" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card">
                <span className="chip border border-warn-100 bg-warn-50 text-warn">
                  <TriangleAlert size={12} aria-hidden /> Unverified
                </span>
                <h3 className="mt-4 font-semibold">Community reports</h3>
                <p className="mt-1.5 text-sm leading-relaxed">Submitted by users. Not checked by any authority. Use as awareness, not instructions.</p>
              </div>
              <div className="card">
                <span className="chip border border-safe-100 bg-safe-50 text-safe">
                  <BadgeCheck size={12} aria-hidden /> Official
                </span>
                <h3 className="mt-4 font-semibold">Official alerts</h3>
                <p className="mt-1.5 text-sm leading-relaxed">
                  Come from 112, IMD, NDMA and district authorities. SafeSphere does not issue or relay them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible AI */}
        <section id="responsible-ai" className="scroll-mt-16 border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="kicker">Privacy &amp; responsible AI</p>
                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Built to be trusted.</h2>
              </div>
              <Link href="/privacy" className="btn btn-ghost self-start text-brand sm:self-auto">
                Read the privacy notice <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRINCIPLES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-line p-5">
                  <Icon size={20} className="text-brand" aria-hidden />
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">Be ready before you need it.</h2>
                <p className="mt-2 text-slate-300">Free to try. Takes a minute to set up.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="btn h-12 bg-white px-6 text-base text-ink hover:bg-brand-50">
                  Get started <ArrowRight size={18} aria-hidden />
                </Link>
                <Link href="/guidance" className="btn h-12 border border-white/25 px-6 text-base text-white hover:bg-white/10">
                  <ShieldAlert size={18} aria-hidden /> View guidance
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
