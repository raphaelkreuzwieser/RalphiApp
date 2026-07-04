/** Gemeinsame Validierungen für Auth (Client + Server nutzen dieselben Regeln). */

export const USERNAME_RE = /^[A-Za-z0-9_.]+$/;

export function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 24)
    return "Username muss 3–24 Zeichen haben.";
  if (!USERNAME_RE.test(username))
    return "Nur Buchstaben, Zahlen, Punkt und Unterstrich erlaubt.";
  return null;
}

/** 18+-Prüfung: Geburtsdatum muss mindestens 18 Jahre zurückliegen. */
export function isAdult(birthdate: string, today: Date = new Date()): boolean {
  const b = new Date(birthdate);
  if (Number.isNaN(b.getTime())) return false;
  const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  // b <= cutoff  →  volljährig
  return b.getTime() <= cutoff.getTime();
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Passwort muss mindestens 8 Zeichen haben.";
  return null;
}

export function isEmail(value: string): boolean {
  return value.includes("@");
}
