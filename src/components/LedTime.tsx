import { formatSeconds } from "@/lib/format";

type LedTimeSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<LedTimeSize, string> = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

/**
 * Signature-Element: LED-Zeitanzeige wie am echten Shotrace Pack.
 * Gold, Monospace, Glow, tabular-nums. Format 3,42 s.
 */
export function LedTime({
  seconds,
  size = "md",
  withUnit = true,
  className = "",
}: {
  seconds: number | null | undefined;
  size?: LedTimeSize;
  withUnit?: boolean;
  className?: string;
}) {
  return (
    <span className={`led ${sizeClasses[size]} ${className}`} aria-label={formatSeconds(seconds)}>
      {formatSeconds(seconds, { withUnit })}
    </span>
  );
}
