"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { requestPasswordResetAction, type AuthState } from "../actions";
import { Field, Submit, ErrorNote, SuccessNote } from "@/components/auth/fields";

export function PasswortVergessenForm() {
  const [state, action] = useFormState<AuthState, FormData>(requestPasswordResetAction, {});

  return (
    <form action={action}>
      <ErrorNote message={state.error} />
      <SuccessNote message={state.ok ? state.message : undefined} />
      {!state.ok && (
        <>
          <Field label="E-Mail" name="email" type="email" inputMode="email"
            autoComplete="email" required />
          <Submit>Link anfordern</Submit>
        </>
      )}
      <div className="mt-4 text-center text-[13px] text-muted">
        <Link href="/login" className="font-bold text-bussi">
          Zurück zum Login
        </Link>
      </div>
    </form>
  );
}
