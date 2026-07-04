import { AuthStub } from "@/components/AuthStub";

export const metadata = { title: "Anmelden" };

export default function LoginPage() {
  return <AuthStub title="Anmelden" hint="Willkommen zurück! Login mit E-Mail oder Username." />;
}
