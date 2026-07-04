"use client";

import { useFormState } from "react-dom";
import { updatePasswordAction, type AuthState } from "../actions";
import { Field, Submit, ErrorNote } from "@/components/auth/fields";

export function PasswortNeuForm() {
  const [state, action] = useFormState<AuthState, FormData>(updatePasswordAction, {});

  return (
    <form action={action}>
      <ErrorNote message={state.error} />
      <Field label="Neues Passwort" name="password" type="password"
        autoComplete="new-password" required />
      <Submit>Passwort speichern</Submit>
    </form>
  );
}
