"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
      {children}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
  autoComplete,
  inputMode,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  max?: string;
}) {
  return (
    <label className="mb-3 block">
      <Label>
        {label}
        {required && <span className="text-rot"> *</span>}
      </Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        max={max}
        className="w-full rounded-[10px] border border-line bg-panel2 p-3 text-[15px] text-creme placeholder:text-muted focus:border-rot focus:outline-none"
      />
    </label>
  );
}

/** Absende-Button, zeigt den Pending-State der umschließenden <form>. */
export function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rot px-4 py-3 text-sm font-bold text-white shadow-[0_4px_18px_rgba(232,40,60,0.35)] transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
      {message}
    </div>
  );
}

export function SuccessNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-3 rounded-xl border border-[#2C5C40] bg-[rgba(123,224,163,0.1)] p-3 text-[13px] text-creme">
      {message}
    </div>
  );
}
