"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpenCheck,
  FileWarning,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPinned,
  Phone,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Timer,
  Users,
  UsersRound,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { api } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useStoredState } from "@/lib/storage";
import type { CheckIn, Contact, IncidentReport, SosState } from "@/lib/types";
import { useGeolocation } from "@/lib/use-geolocation";
import { CheckInPanel } from "./checkin-panel";
import { CommunityPanel } from "./community-panel";
import { ContactsPanel, type ContactDraft } from "./contacts-panel";
import { DataPanel } from "./data-panel";
import { GuidancePanel } from "./guidance-panel";
import { InsightsPanel } from "./insights-panel";
import { LocationPanel } from "./location-panel";
import { QuickActions } from "./quick-actions";
import { ReportsPanel, type NewReport, type ReportPatch } from "./reports-panel";
import { SosConfirmModal, SosPanel } from "./sos-panel";
import { StatusBanner } from "./status-banner";
import { Toast, type ToastMessage } from "./toast";
import { FakeCallModal } from "./fake-call-modal";
import { ResponderPanel } from "./responder-panel";
import { CommandPanel } from "./command-panel";
import { soundEngine } from "@/lib/sound";

export type DashboardUser = { id: string; name: string; email: string; image: string | null };
export type Notify = (message: string, tone?: ToastMessage["tone"]) => void;

const NO_SOS: SosState | null = null;
const NO_CHECKIN: CheckIn | null = null;

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sos", label: "SOS", icon: Siren },
  { id: "responder", label: "Responder Mesh", icon: ShieldAlert },
  { id: "command", label: "Command Center", icon: Radio },
  { id: "checkin", label: "Check-in", icon: Timer },
  { id: "location", label: "Location & help", icon: MapPinned },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "reports", label: "Reports", icon: FileWarning },
  { id: "community", label: "Community", icon: UsersRound },
  { id: "guidance", label: "Guidance", icon: BookOpenCheck },
  { id: "privacy", label: "Privacy & data", icon: ShieldCheck },
] as const;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const sync = window.setTimeout(() => setNow(Date.now()), 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(sync);
    };
  }, [active]);
  return now;
}

/** Highlights the sidebar item for the section currently in view. */
function useActiveSection() {
  const [active, setActive] = useState<string>("overview");
  useEffect(() => {
    const elements = SECTIONS.map((section) => document.getElementById(section.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return active;
}

function Avatar({ user, size = 36 }: { user: DashboardUser; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (user.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external OAuth avatar; next/image would need a remote allowlist
      <img
        src={user.image}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}

export function Dashboard({
  user,
  initialContacts,
  initialReports,
}: {
  user: DashboardUser;
  initialContacts: Contact[];
  initialReports: IncidentReport[];
}) {
  const router = useRouter();
  const scope = `u:${user.id}:`;
  const geo = useGeolocation();
  const [contacts, setContacts] = useState(initialContacts);
  const [reports, setReports] = useState(initialReports);
  const [sos, setSos] = useStoredState<SosState | null>(`${scope}sos`, NO_SOS);
  const [checkIn, setCheckIn] = useStoredState<CheckIn | null>(`${scope}checkin`, NO_CHECKIN);
  const [sosConfirmOpen, setSosConfirmOpen] = useState(false);
  const [fakeCallOpen, setFakeCallOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [communityVersion, setCommunityVersion] = useState(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | null>(null);
  const now = useNow(Boolean(checkIn));
  const activeSection = useActiveSection();

  const notify = useCallback<Notify>((message, tone = "success") => {
    setToast({ id: Date.now(), message, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const toggleDashboardSiren = useCallback(() => {
    if (isSirenActive) {
      soundEngine.stopSiren();
      setIsSirenActive(false);
    } else {
      soundEngine.startSiren();
      setIsSirenActive(true);
      notify("100dB Emergency Siren blaring!", "error");
    }
  }, [isSirenActive, notify]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const checkInExpired = Boolean(checkIn && now >= checkIn.deadline);
  const checkInAlarm = checkInExpired && !checkIn?.acknowledgedAt;

  // Make an overdue check-in visible even when the tab is in the background.
  useEffect(() => {
    if (!checkInAlarm) return;
    const original = document.title;
    document.title = "⚠ Check-in overdue · SafeSphere";
    navigator.vibrate?.([300, 150, 300]);
    return () => {
      document.title = original;
    };
  }, [checkInAlarm]);

  const activateSos = useCallback(() => {
    const activatedAt = Date.now();
    const recent = geo.position && activatedAt - geo.position.timestamp < 120_000 ? geo.position : undefined;
    setSos({ activatedAt, location: recent });
    setSosConfirmOpen(false);
    document.getElementById("sos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Location is fetched in the background — call and share actions are usable immediately.
    void geo.locateOnce().then((point) => {
      setSos((previous) => {
        if (!previous || previous.activatedAt !== activatedAt) return previous;
        if (point) return { ...previous, location: point, locationError: undefined };
        return previous.location ? previous : { ...previous, locationError: "Location unavailable. Describe your surroundings when you call." };
      });
    });
  }, [geo, setSos]);

  // ── Server-backed records ────────────────────────────────────────────────
  const saveContact = useCallback(
    async (draft: ContactDraft, editingId: string | null) => {
      const result = editingId
        ? await api<{ contact: Contact }>(`/api/contacts/${editingId}`, { method: "PATCH", body: draft })
        : await api<{ contact: Contact }>("/api/contacts", { method: "POST", body: draft });
      if (!result.ok) return result.error;
      const saved = result.data.contact;
      setContacts((list) => (editingId ? list.map((c) => (c.id === editingId ? saved : c)) : [...list, saved]));
      notify(editingId ? `${saved.name} updated.` : `${saved.name} added.`);
      return null;
    },
    [notify],
  );

  const deleteContact = useCallback(
    async (contact: Contact) => {
      const result = await api(`/api/contacts/${contact.id}`, { method: "DELETE" });
      if (!result.ok) {
        notify(result.error, "error");
        return;
      }
      setContacts((list) => list.filter((c) => c.id !== contact.id));
      notify(`${contact.name} removed.`, "info");
    },
    [notify],
  );

  const createReport = useCallback(
    async (input: NewReport) => {
      const result = await api<{ report: IncidentReport }>("/api/reports", { method: "POST", body: input });
      if (!result.ok) return result.error;
      setReports((list) => [result.data.report, ...list]);
      if (input.shared) setCommunityVersion((v) => v + 1);
      notify(input.shared ? "Report saved and shared anonymously (unverified)." : "Report saved. Only you can see it.");
      return null;
    },
    [notify],
  );

  const updateReport = useCallback(
    async (id: string, patch: ReportPatch) => {
      const result = await api<{ report: IncidentReport }>(`/api/reports/${id}`, { method: "PATCH", body: patch });
      if (!result.ok) return result.error;
      setReports((list) => list.map((r) => (r.id === id ? result.data.report : r)));
      setCommunityVersion((v) => v + 1);
      notify("Report updated.");
      return null;
    },
    [notify],
  );

  const deleteReport = useCallback(
    async (report: IncidentReport) => {
      const result = await api(`/api/reports/${report.id}`, { method: "DELETE" });
      if (!result.ok) {
        notify(result.error, "error");
        return;
      }
      setReports((list) => list.filter((r) => r.id !== report.id));
      if (report.shared) setCommunityVersion((v) => v + 1);
      notify("Report deleted.", "info");
    },
    [notify],
  );

  async function signOut() {
    setSigningOut(true);
    geo.clear();
    await authClient.signOut().catch(() => undefined);
    router.replace("/login?reason=signedout");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center px-5">
          <Logo href="/dashboard" />
        </div>
        <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const current = activeSection === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={current ? "location" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      current ? "bg-brand-50 text-brand" : "text-body hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <Icon size={18} aria-hidden />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-2 border-t border-line p-3">
          {sos ? (
            <a href="#sos" className="btn btn-danger h-11 w-full">
              <Siren size={18} aria-hidden /> SOS active
            </a>
          ) : (
            <button type="button" className="btn btn-danger h-11 w-full" onClick={() => setSosConfirmOpen(true)}>
              <Siren size={18} aria-hidden /> SOS
            </button>
          )}
          <a href="tel:112" className="btn btn-secondary h-10 w-full border-danger-100 text-danger">
            <Phone size={16} aria-hidden /> Call 112
          </a>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <Logo href="/dashboard" />
            </div>
            <p className="hidden text-sm font-semibold text-ink lg:block">Dashboard</p>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2.5">
                <Avatar user={user} />
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-48 truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="max-w-48 truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void signOut()} disabled={signingOut}>
                {signingOut ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <LogOut size={14} aria-hidden />}
                <span className="hidden sm:inline">Sign out</span>
                <span className="sr-only sm:hidden">Sign out</span>
              </button>
            </div>
          </div>
          {/* Mobile section nav */}
          <nav aria-label="Dashboard sections" className="border-t border-line lg:hidden">
            <ul className="flex gap-1 overflow-x-auto px-3 py-2">
              {SECTIONS.map(({ id, label }) => (
                <li key={id} className="shrink-0">
                  <a
                    href={`#${id}`}
                    aria-current={activeSection === id ? "location" : undefined}
                    className={`block rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                      activeSection === id ? "bg-brand-50 text-brand" : "text-body hover:bg-surface"
                    }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id="main" className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12">
          <section id="overview" aria-labelledby="welcome" className="scroll-mt-28">
            <h1 id="welcome" className="text-2xl font-bold sm:text-3xl">
              Hi {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted">
              In an emergency, call{" "}
              <a href="tel:112" className="font-semibold text-danger underline underline-offset-2">
                112
              </a>{" "}
              first.
            </p>
            <div className="mt-5">
              <StatusBanner
                sos={sos}
                checkIn={checkIn}
                checkInExpired={checkInExpired}
                geoStatus={geo.status}
                hasPosition={Boolean(geo.position)}
                contactsCount={contacts.length}
              />
            </div>
          </section>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <SosPanel
              sos={sos}
              userName={user.name}
              contacts={contacts}
              geoError={geo.error}
              onRequestActivate={() => setSosConfirmOpen(true)}
              onEnd={() => {
                setSos(null);
                notify("SOS ended.");
              }}
              onRetryLocation={activateSos}
              notify={notify}
            />
            <CheckInPanel
              checkIn={checkIn}
              now={now}
              expired={checkInExpired}
              onStart={(minutes, label) => {
                const startedAt = Date.now();
                setCheckIn({ startedAt, minutes, deadline: startedAt + minutes * 60_000, label });
                notify(`Check-in started for ${minutes} min.`);
              }}
              onExtend={(minutes) =>
                setCheckIn((current) =>
                  current ? { ...current, acknowledgedAt: undefined, deadline: Math.max(current.deadline, Date.now()) + minutes * 60_000 } : current,
                )
              }
              onAcknowledge={() => setCheckIn((current) => (current ? { ...current, acknowledgedAt: Date.now() } : current))}
              onSafe={() => {
                setCheckIn(null);
                notify("Marked safe. Check-in ended.");
              }}
              onCancel={() => {
                setCheckIn(null);
                notify("Check-in cancelled.", "info");
              }}
              onSos={() => setSosConfirmOpen(true)}
            />
            <QuickActions
              onShareLocation={() => {
                document.getElementById("location")?.scrollIntoView({ behavior: "smooth" });
                geo.startWatching();
              }}
              onNewReport={() => setReportOpen(true)}
              onAddContact={() => setContactOpen(true)}
              onTriggerFakeCall={() => setFakeCallOpen(true)}
              onToggleSiren={toggleDashboardSiren}
              isSirenActive={isSirenActive}
            />

            {/* First Responder Mesh View */}
            <section id="responder" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-[var(--foreground)]">Guardian First Responder Mesh</h2>
              </div>
              <ResponderPanel
                onNotify={(msg, tone) =>
                  notify(msg, tone === "urgent" ? "error" : tone === "positive" ? "success" : "info")
                }
              />
            </section>

            {/* Tactical Incident Command Center */}
            <section id="command" className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-2">
                <Radio className="text-danger" size={20} />
                <h2 className="text-lg font-bold text-[var(--foreground)]">Tactical Incident Command Center</h2>
              </div>
              <CommandPanel
                onNotify={(msg, tone) =>
                  notify(msg, tone === "urgent" ? "error" : tone === "positive" ? "success" : "info")
                }
              />
            </section>

            <LocationPanel geo={geo} notify={notify} />
            <ContactsPanel
              contacts={contacts}
              onSave={saveContact}
              onDelete={deleteContact}
              notify={notify}
              formOpen={contactOpen}
              setFormOpen={setContactOpen}
            />

            <ReportsPanel
              reports={reports}
              geo={geo}
              formOpen={reportOpen}
              setFormOpen={setReportOpen}
              onCreate={createReport}
              onUpdate={updateReport}
              onDelete={deleteReport}
            />
            <InsightsPanel reports={reports} />

            <CommunityPanel version={communityVersion} />
            <DataPanel
              scope={scope}
              local={{ sos, checkIn }}
              onDataDeleted={() => {
                setContacts([]);
                setReports([]);
                setSos(null);
                setCheckIn(null);
                geo.clear();
                setCommunityVersion((v) => v + 1);
                notify("Your contacts, reports and local safety state were deleted.");
              }}
              notify={notify}
            />

            <GuidancePanel />
          </div>

          <p className="mt-10 text-center text-xs text-muted">
            SafeSphere is a student prototype and not an emergency service. Map data © OpenStreetMap contributors.
          </p>
        </main>
      </div>

      {/* Always-reachable SOS on small screens */}
      {!sos && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl gap-2">
            <button type="button" className="btn btn-danger h-14 flex-1 text-lg tracking-wide" onClick={() => setSosConfirmOpen(true)}>
              <Siren size={22} aria-hidden /> SOS
            </button>
            <a href="tel:112" className="btn btn-secondary h-14 border-danger-100 px-5 text-danger" aria-label="Call 112">
              <Phone size={20} aria-hidden /> 112
            </a>
          </div>
        </div>
      )}

      <SosConfirmModal open={sosConfirmOpen} onClose={() => setSosConfirmOpen(false)} onConfirm={activateSos} />
      <FakeCallModal open={fakeCallOpen} onClose={() => setFakeCallOpen(false)} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
