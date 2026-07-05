import { AuthBrand } from "@/components/auth/AuthBrand";
import { PasswortVergessenForm } from "./PasswortVergessenForm";

export const metadata = { title: "Passwort vergessen" };

export default function PasswortVergessenPage() {
  return (
    <>
      <AuthBrand subtitle="Kein Problem – wir schicken dir einen Link zum Zurücksetzen." />
      <PasswortVergessenForm />
    </>
  );
}
