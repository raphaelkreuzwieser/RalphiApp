"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { registerAction, type AuthState } from "../actions";
import { Field, Label, Submit, ErrorNote, SuccessNote } from "@/components/auth/fields";
import type { Country } from "@/lib/database.types";

export function RegisterForm({
  countries,
  maxBirthdate,
}: {
  countries: Country[];
  maxBirthdate: string;
}) {
  const [state, action] = useFormState<AuthState, FormData>(registerAction, {});

  if (state.ok) {
    return <SuccessNote message={state.message} />;
  }

  return (
    <form action={action}>
      <ErrorNote message={state.error} />

      <Field label="Name (privat)" name="full_name" placeholder="Hans Huber" required
        autoComplete="name" />
      <p className="-mt-1.5 mb-3 text-[11px] text-muted">
        Dein echter Name ist privat – öffentlich sieht man immer nur deinen Username.
      </p>

      <Field label="Username (öffentlich)" name="username" placeholder="schnapshansi"
        autoComplete="username" required />

      <label className="mb-3 block">
        <Label>
          Land<span className="text-rot"> *</span>
        </Label>
        <select
          name="country_id"
          required
          defaultValue="AT"
          className="w-full appearance-none rounded-[10px] border border-line bg-panel2 p-3 text-[15px] text-creme focus:border-rot focus:outline-none"
        >
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </label>

      <Field label="Bundesland" name="bundesland" placeholder="Oberösterreich" />

      <Field label="Geburtsdatum" name="birthdate" type="date" required max={maxBirthdate} />
      <p className="-mt-1.5 mb-3 text-[11px] text-muted">🔞 Nur ab 18 Jahren.</p>

      <Field label="E-Mail" name="email" type="email" inputMode="email"
        autoComplete="email" required />
      <Field label="Telefonnummer" name="phone" type="tel" inputMode="tel"
        placeholder="+43 …" autoComplete="tel" />
      <Field label="Passwort" name="password" type="password"
        autoComplete="new-password" required />

      <label className="mb-3 flex items-start gap-2.5 text-[13px] text-creme">
        <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 accent-[#E8283C]" />
        <span>
          Ich akzeptiere die{" "}
          <Link href="/datenschutz" className="text-bussi underline">
            Datenschutzerklärung
          </Link>
          . <span className="text-rot">*</span>
        </span>
      </label>

      <div className="mb-4 rounded-xl border border-line bg-panel2 p-3 text-[12px] text-muted">
        ℹ️ Beim Check-in kannst du optional deinen Standort mit Freunden teilen. Das ist
        freiwillig und jederzeit in den Einstellungen abschaltbar.
      </div>

      <Submit>Konto erstellen</Submit>

      <div className="mt-4 text-center text-[13px] text-muted">
        Schon dabei?{" "}
        <Link href="/login" className="font-bold text-bussi">
          Anmelden
        </Link>
      </div>
    </form>
  );
}
