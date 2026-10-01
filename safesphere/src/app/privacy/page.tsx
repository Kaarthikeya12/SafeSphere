import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";

export const metadata: Metadata = { title: "Privacy & responsible AI" };

const SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "What we store",
    points: [
      "Your account: name, email, and a password hash (or your Google profile name, email and picture if you use Google).",
      "Trusted contacts and incident reports you create, stored on the SafeSphere server and visible only to you.",
      "SOS and check-in status are kept in your browser on this device only.",
    ],
  },
  {
    title: "Location",
    points: [
      "Requested only when you press a location action. You can stop sharing at any time.",
      "Live location stays in your browser’s memory and is not saved on our server.",
      "Location is stored only if you attach it to a report yourself.",
      "Nearby-help search sends an approximate position (rounded to about 100 m) to OpenStreetMap’s public Overpass service.",
    ],
  },
  {
    title: "Community sharing",
    points: [
      "Reports are private unless you tick “Share anonymously with the community”.",
      "Shared reports show category, description, time and an area rounded to roughly 1 km — never your name or email.",
      "All community reports are unverified. They are not official alerts and are not sent to any authority.",
    ],
  },
  {
    title: "AI assistance",
    points: [
      "The incident assistant runs only when you press “Suggest category”.",
      "If the server has an Anthropic API key, the description text (no name, email or coordinates) is sent to Claude for a suggested category and summary. Otherwise a rule-based keyword matcher runs, and is labelled “not AI”.",
      "Suggestions show their confidence, reasoning and uncertainty. You choose the final category.",
      "AI never runs during SOS, calling, or location sharing, and it does not verify reports, diagnose, or predict danger.",
    ],
  },
  {
    title: "Your controls",
    points: [
      "Export all your data as JSON from the dashboard.",
      "Delete your contacts and reports, or delete your whole account.",
    ],
  },
  {
    title: "Limits of this prototype",
    points: [
      "SafeSphere is a student prototype, not an emergency service. It never contacts anyone automatically.",
      "It has not had a formal security or legal compliance assessment.",
      "Use test data for demos. Don’t enter real third-party personal information you don’t have permission to store.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="kicker">Privacy &amp; responsible AI</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">How SafeSphere handles your data</h1>
          <div className="mt-10 space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
