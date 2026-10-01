import { GuidanceBrowser } from "@/components/guidance/guidance-browser";

export function GuidancePanel() {
  return (
    <section id="guidance" aria-labelledby="guidance-title" className="card scroll-mt-32 lg:col-span-3 lg:scroll-mt-20">
      <p className="kicker">Emergency guidance</p>
      <h2 id="guidance-title" className="mt-1 mb-4 text-lg font-bold">
        What to do first
      </h2>
      <GuidanceBrowser compact />
    </section>
  );
}
