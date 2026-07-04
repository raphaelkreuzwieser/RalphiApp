import { AuthStub } from "@/components/AuthStub";

export const metadata = { title: "Registrieren" };

export default function RegistrierenPage() {
  return (
    <AuthStub
      title="Registrieren"
      hint="Wie schnell bist du? Beweis es. 🏁 Registrierung ab 18 Jahren."
    />
  );
}
