/**
 * Zeit-Formatierung im Gschpusi-Stil: Komma als Dezimaltrennzeichen,
 * z. B. 3,42 s. Wird überall in der LED-Anzeige verwendet.
 */
export function formatSeconds(
  seconds: number | null | undefined,
  { withUnit = true, decimals = 2 }: { withUnit?: boolean; decimals?: number } = {},
): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return withUnit ? "—,— s" : "—,—";
  }
  const value = seconds.toFixed(decimals).replace(".", ",");
  return withUnit ? `${value} s` : value;
}

/**
 * Parst eine Zeit-Eingabe, akzeptiert Komma ODER Punkt als Trennzeichen.
 * Gibt null zurück, wenn nicht parsbar oder <= 0.
 */
export function parseTimeInput(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (Number.isNaN(value) || value <= 0) return null;
  return value;
}

/** Relative Zeit auf Deutsch, z. B. "vor 12 min". */
export function relativeTime(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.round((now.getTime() - then.getTime()) / 1000);

  if (diffSec < 30) return "gerade eben";
  if (diffSec < 60) return `vor ${diffSec} s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `vor ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `vor ${diffD} ${diffD === 1 ? "Tag" : "Tagen"}`;
  return then.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" });
}
