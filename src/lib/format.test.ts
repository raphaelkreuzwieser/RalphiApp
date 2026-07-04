import { describe, it, expect } from "vitest";
import { formatSeconds, parseTimeInput, relativeTime } from "./format";

describe("formatSeconds", () => {
  it("nutzt Komma als Dezimaltrennzeichen mit Einheit", () => {
    expect(formatSeconds(3.42)).toBe("3,42 s");
    expect(formatSeconds(3.4)).toBe("3,40 s");
  });
  it("kann ohne Einheit formatieren", () => {
    expect(formatSeconds(3.42, { withUnit: false })).toBe("3,42");
  });
  it("zeigt Platzhalter für null/undefined/NaN", () => {
    expect(formatSeconds(null)).toBe("—,— s");
    expect(formatSeconds(undefined)).toBe("—,— s");
    expect(formatSeconds(NaN)).toBe("—,— s");
  });
});

describe("parseTimeInput", () => {
  it("akzeptiert Komma und Punkt", () => {
    expect(parseTimeInput("3,42")).toBe(3.42);
    expect(parseTimeInput("3.42")).toBe(3.42);
    expect(parseTimeInput(" 4,0 ")).toBe(4);
  });
  it("lehnt Ungültiges / <= 0 ab", () => {
    expect(parseTimeInput("")).toBeNull();
    expect(parseTimeInput("abc")).toBeNull();
    expect(parseTimeInput("-1")).toBeNull();
    expect(parseTimeInput("0")).toBeNull();
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-07-04T12:00:00Z");
  it("formatiert Minuten und Stunden auf Deutsch", () => {
    expect(relativeTime(new Date("2026-07-04T11:48:00Z"), now)).toBe("vor 12 min");
    expect(relativeTime(new Date("2026-07-04T09:00:00Z"), now)).toBe("vor 3 h");
    expect(relativeTime(new Date("2026-07-04T11:59:50Z"), now)).toBe("gerade eben");
  });
});
