import { CheckCircle2, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

const POINTS = [
  "SOS with 112, your location and a ready message",
  "Trusted contacts, live location and check-ins",
  "Incident reports with AI you can correct",
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_100%_0%,#e3ecff_0%,transparent_70%)]"
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-bold">Safety, within reach.</h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-safe" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-muted">
          <Phone size={16} className="text-danger" aria-hidden />
          In an emergency, don’t sign up —{" "}
          <a href="tel:112" className="font-semibold text-danger underline underline-offset-2">
            call 112
          </a>
        </p>
      </aside>

      <main id="main" className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 mb-8 text-body">{subtitle}</p>
          {children}
        </div>
        <p className="text-center text-sm text-muted lg:hidden">
          Emergency right now?{" "}
          <a href="tel:112" className="font-semibold text-danger underline underline-offset-2">
            Call 112
          </a>
        </p>
      </main>
    </div>
  );
}
