"use client";

import { useState } from "react";
import { Download, Loader2, ShieldCheck, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { writeValue } from "@/lib/storage";
import type { CheckIn, SosState } from "@/lib/types";
import type { ToastMessage } from "./toast";

const LOCAL_KEYS = ["sos", "checkin"];

export function DataPanel({
  scope,
  local,
  onDataDeleted,
  notify,
}: {
  scope: string;
  local: { sos: SosState | null; checkIn: CheckIn | null };
  onDataDeleted: () => void;
  notify: (message: string, tone?: ToastMessage["tone"]) => void;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<"data" | "account" | null>(null);
  const [busy, setBusy] = useState<"export" | "data" | "account" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clearLocal() {
    LOCAL_KEYS.forEach((key) => writeValue(`${scope}${key}`, null));
  }

  async function exportData() {
    setBusy("export");
    const result = await api<Record<string, unknown>>("/api/account");
    setBusy(null);
    if (!result.ok) {
      notify(result.error, "error");
      return;
    }
    const blob = new Blob([JSON.stringify({ ...result.data, thisDevice: local }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `safesphere-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Export downloaded.", "info");
  }

  async function deleteData() {
    setBusy("data");
    setError(null);
    const result = await api("/api/account", { method: "DELETE" });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    clearLocal();
    setConfirm(null);
    onDataDeleted();
  }

  async function deleteAccount() {
    setBusy("account");
    setError(null);
    const { error: failure } = await authClient.deleteUser();
    if (failure) {
      setBusy(null);
      setError(
        failure.code === "SESSION_EXPIRED" || failure.status === 400
          ? "For security, please sign out and sign back in, then try again."
          : "We couldn’t delete your account. Please try again.",
      );
      return;
    }
    clearLocal();
    router.replace("/login?reason=deleted");
    router.refresh();
  }

  return (
    <section id="privacy" aria-labelledby="privacy-title" className="card scroll-mt-32 lg:scroll-mt-20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Privacy &amp; data</p>
          <h2 id="privacy-title" className="mt-1 text-lg font-bold">
            You’re in control
          </h2>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-safe-50 text-safe">
          <ShieldCheck size={20} aria-hidden />
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs text-muted">
        <li>Contacts and reports: your account only.</li>
        <li>SOS and check-in: this device only.</li>
        <li>Live location: never stored.</li>
      </ul>
      <div className="mt-4 grid gap-2">
        <button type="button" className="btn btn-secondary btn-sm justify-start" onClick={() => void exportData()} disabled={busy !== null}>
          {busy === "export" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Download size={14} aria-hidden />} Export my data
        </button>
        <button type="button" className="btn btn-secondary btn-sm justify-start hover:text-danger" onClick={() => setConfirm("data")}>
          <Trash2 size={14} aria-hidden /> Delete contacts &amp; reports
        </button>
        <button type="button" className="btn btn-ghost btn-sm justify-start text-danger hover:bg-danger-50" onClick={() => setConfirm("account")}>
          <UserX size={14} aria-hidden /> Delete account
        </button>
      </div>
      <Link href="/privacy" className="mt-3 inline-block text-xs font-semibold text-brand hover:underline">
        Privacy notice
      </Link>

      <Modal
        open={confirm !== null}
        onClose={() => {
          setConfirm(null);
          setError(null);
        }}
        tone="danger"
        title={confirm === "account" ? "Delete your account?" : "Delete your contacts and reports?"}
        description={
          confirm === "account"
            ? "This permanently deletes your account, contacts, reports and shared reports. It can’t be undone."
            : "This permanently deletes your saved contacts and reports (including shared ones) and clears SOS and check-in on this device."
        }
      >
        {error && (
          <p role="alert" className="mb-3 rounded-xl border border-danger-100 bg-danger-50 p-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={() => setConfirm(null)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={busy !== null}
            onClick={() => void (confirm === "account" ? deleteAccount() : deleteData())}
          >
            {(busy === "data" || busy === "account") && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {confirm === "account" ? "Delete account" : "Delete data"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
