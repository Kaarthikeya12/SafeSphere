import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { GuidanceBrowser } from "@/components/guidance/guidance-browser";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";

export const metadata: Metadata = { title: "Emergency guidance" };

export default function GuidancePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">No account needed</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Emergency guidance</h1>
              <p className="mt-2 max-w-xl text-body">What to do first, what to avoid, and how to prepare.</p>
            </div>
            <a href="tel:112" className="btn btn-danger h-12 px-6 text-base">
              <Phone size={18} aria-hidden /> Call 112
            </a>
          </div>
          <div className="mt-10">
            <GuidanceBrowser />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
