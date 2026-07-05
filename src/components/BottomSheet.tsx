"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

/** Bottom-Sheet-Container (für "Lauf einreichen", "Check-in"). */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-[rgba(10,4,6,0.9)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85%] w-full overflow-y-auto rounded-t-[22px] border-t border-line bg-panel p-5"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(20px + var(--sab))" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-base font-black text-creme">{title}</div>
          <button onClick={onClose} aria-label="Schließen" className="text-muted">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
