"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { loginAction, type AuthState } from "../actions";
import { Field, Submit, ErrorNote } from "@/components/auth/fields";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action] = useFormState<AuthState, FormData>(loginAction, {
    error: initialError,
  });

  return (
    <form action={action}>
      <ErrorNote message={state.error} />
      <Field
        label="E-Mail oder Username"
        name="identifier"
        placeholder="schnapshansi"
        autoComplete="username"
        required
      />
      <Field
        label="Passwort"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <div className="mb-4 text-right">
        <Link href="/passwort-vergessen" className="text-[13px] text-muted underline">
          Passwort vergessen?
        </Link>
      </div>
      <Submit>Anmelden</Submit>
      <div className="mt-4 text-center text-[13px] text-muted">
        Neu hier?{" "}
        <Link href="/registrieren" className="font-bold text-bussi">
          Registrieren
        </Link>
      </div>
    </form>
  );
}
