import { AuthStub } from "@/components/AuthStub";

export const metadata = { title: "Passwort vergessen" };

export default function PasswortVergessenPage() {
  return (
    <AuthStub
      title="Passwort vergessen"
      hint="Kein Problem – wir schicken dir einen Link zum Zurücksetzen."
    />
  );
}
