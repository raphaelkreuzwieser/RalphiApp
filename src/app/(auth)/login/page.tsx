import { AuthBrand } from "@/components/auth/AuthBrand";
import { AGE_NOTICE } from "@/lib/assets";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { fehler?: string };
}) {
  return (
    <>
      <AuthBrand subtitle="Wie schnell bist du? Beweis es. 🏁" />
      <LoginForm initialError={searchParams.fehler} />
      <div className="mt-8 text-center text-[11px] text-muted">{AGE_NOTICE}</div>
    </>
  );
}
