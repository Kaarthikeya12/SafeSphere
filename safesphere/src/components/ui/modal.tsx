"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal built on the native <dialog> element: focus is trapped
 * by the browser, Escape closes it, and focus returns to the trigger.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  tone = "default",
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`m-auto w-[calc(100%-2rem)] rounded-2xl border bg-white p-0 text-body shadow-[var(--shadow-pop)] backdrop:bg-slate-900/40 backdrop:backdrop-blur-[2px] ${
        size === "lg" ? "max-w-2xl" : "max-w-lg"
      } ${tone === "danger" ? "border-danger-100" : "border-line"}`}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className={`text-lg font-bold ${tone === "danger" ? "text-danger" : "text-ink"}`}>
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted">
                  {description}
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm -mt-1 -mr-2 px-2" aria-label="Close dialog">
              <X size={18} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
