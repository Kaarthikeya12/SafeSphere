"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastMessage = { id: number; message: string; tone: "success" | "info" | "error" };

export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  const Icon = toast?.tone === "error" ? AlertTriangle : toast?.tone === "info" ? Info : CheckCircle2;
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-6">
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink shadow-[var(--shadow-pop)]"
        >
          <Icon
            size={18}
            aria-hidden
            className={`mt-0.5 shrink-0 ${toast.tone === "error" ? "text-danger" : toast.tone === "info" ? "text-brand" : "text-safe"}`}
          />
          <span className="flex-1">{toast.message}</span>
          <button type="button" onClick={onDismiss} className="-m-1 rounded p-1 text-muted hover:text-ink" aria-label="Dismiss notification">
            <X size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
