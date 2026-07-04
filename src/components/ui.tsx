import type { ReactNode } from "react";
import type { SubmissionStatus } from "@/lib/database.types";

/* Design-Primitive aus dem Prototyp (prototyp-referenz.jsx), als Tailwind-Komponenten. */

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Tag className={`card p-3.5 ${className}`}>{children}</Tag>;
}

type BtnKind = "primary" | "ghost" | "gold" | "danger" | "soft";

const btnKinds: Record<BtnKind, string> = {
  primary: "bg-rot text-white shadow-[0_4px_18px_rgba(232,40,60,0.35)]",
  ghost: "bg-transparent text-creme border border-line",
  gold: "bg-gold text-[#3A2200]",
  danger: "bg-transparent text-rot border border-rot-dark",
  soft: "bg-panel2 text-creme",
};

export function Btn({
  children,
  kind = "primary",
  className = "",
  disabled,
  type = "button",
  ...rest
}: {
  children: ReactNode;
  kind?: BtnKind;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition
        active:scale-[0.98] disabled:opacity-45 disabled:cursor-default ${btnKinds[kind]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Tag({
  children,
  color = "text-muted",
  border = "border-line",
}: {
  children: ReactNode;
  color?: string;
  border?: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[11px] font-bold ${color} ${border}`}
    >
      {children}
    </span>
  );
}

export function StatusTag({ status }: { status: SubmissionStatus }) {
  if (status === "approved")
    return (
      <Tag color="text-[#7BE0A3]" border="border-[#2C5C40]">
        FREIGEGEBEN
      </Tag>
    );
  if (status === "pending")
    return (
      <Tag color="text-gold" border="border-[#6B4E1E]">
        PENDING
      </Tag>
    );
  return (
    <Tag color="text-rot" border="border-rot-dark">
      ABGELEHNT
    </Tag>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mx-0.5 mb-2.5 mt-[18px] text-[13px] font-extrabold uppercase tracking-[0.12em] text-muted">
      {children}
    </div>
  );
}

/** Avatar aus der Initiale, Rot-Rosa-Gradient (Prototyp). */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-black text-white"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: size * 0.4,
        background: "linear-gradient(135deg, #E8283C, #FF8FA3)",
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

/** Produktbild auf weißem, abgerundetem Chip (dunkler Hintergrund!). */
export function DrinkImg({ src, size = 44 }: { src?: string | null; size?: number }) {
  if (!src) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-panel2"
        style={{ width: size, height: size, minWidth: size, fontSize: size * 0.45 }}
      >
        🥃
      </div>
    );
  }
  return (
    <div
      className="white-chip flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size, minWidth: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-h-[88%] max-w-[82%] object-contain" />
    </div>
  );
}
