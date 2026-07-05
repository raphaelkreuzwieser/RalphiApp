"use client";

/** Schalter im Prototyp-Stil (rot = an). */
export function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-[26px] w-[46px] rounded-full transition-colors ${on ? "bg-rot" : "bg-panel2"}`}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left]"
        style={{ left: on ? 23 : 3 }}
      />
    </button>
  );
}
