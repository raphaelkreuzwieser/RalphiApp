import { describe, it, expect } from "vitest";
import { validateUsername, isAdult, validatePassword, isEmail } from "./validation";

describe("validateUsername", () => {
  it("akzeptiert gültige Usernames", () => {
    expect(validateUsername("schnapshansi")).toBeNull();
    expect(validateUsername("alm_rakete.99")).toBeNull();
  });
  it("lehnt zu kurze/lange ab", () => {
    expect(validateUsername("ab")).not.toBeNull();
    expect(validateUsername("x".repeat(25))).not.toBeNull();
  });
  it("lehnt unerlaubte Zeichen ab", () => {
    expect(validateUsername("bad name")).not.toBeNull();
    expect(validateUsername("emoji😀")).not.toBeNull();
  });
});

describe("isAdult (18+)", () => {
  const today = new Date("2026-07-04");
  it("ist true ab exakt 18 Jahren", () => {
    expect(isAdult("2008-07-04", today)).toBe(true);
    expect(isAdult("2000-01-01", today)).toBe(true);
  });
  it("ist false unter 18", () => {
    expect(isAdult("2008-07-05", today)).toBe(false);
    expect(isAdult("2010-01-01", today)).toBe(false);
  });
  it("ist false bei ungültigem Datum", () => {
    expect(isAdult("keine-datum", today)).toBe(false);
  });
});

describe("validatePassword", () => {
  it("verlangt mindestens 8 Zeichen", () => {
    expect(validatePassword("1234567")).not.toBeNull();
    expect(validatePassword("12345678")).toBeNull();
  });
});

describe("isEmail", () => {
  it("erkennt E-Mail vs. Username grob am @", () => {
    expect(isEmail("a@b.at")).toBe(true);
    expect(isEmail("schnapshansi")).toBe(false);
  });
});
