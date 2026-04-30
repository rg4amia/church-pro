"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8 backdrop-blur-sm">
      <div className="surface-strong w-full max-w-3xl rounded-[32px] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">{title}</h3>
            {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
          </div>
          <button
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] text-[var(--muted)]",
              "hover:border-[var(--line-strong)] hover:text-[var(--foreground)]",
            )}
            onClick={onClose}
            type="button"
            aria-label="Fermer la fenêtre"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
