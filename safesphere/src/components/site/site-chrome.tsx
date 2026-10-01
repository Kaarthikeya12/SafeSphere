import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#community", label: "Community safety" },
  { href: "/guidance", label: "Guidance" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-body hover:bg-surface hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost px-3">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary px-3 sm:px-4">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted">
            Student prototype for the Sankalp Setu Student AI Hackathon. Not an emergency service; not affiliated with any government body.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
          <Link href="/#features" className="hover:text-ink">Features</Link>
          <Link href="/guidance" className="hover:text-ink">Guidance</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy &amp; AI</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <Link href="/signup" className="hover:text-ink">Create account</Link>
          <a href="tel:112" className="font-semibold text-danger">Emergency: 112</a>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        Map data © OpenStreetMap contributors. Guidance is general information, not medical or legal advice.
      </p>
    </footer>
  );
}
