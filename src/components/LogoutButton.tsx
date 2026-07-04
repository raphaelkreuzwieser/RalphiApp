"use client";

import { useFormStatus } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-transparent px-4 py-3 text-sm font-bold text-creme active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />} Abmelden
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={signOutAction} className="mt-2.5">
      <Inner />
    </form>
  );
}
