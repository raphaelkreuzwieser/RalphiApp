import { AuthBrand } from "@/components/auth/AuthBrand";
import { PasswortNeuForm } from "./PasswortNeuForm";

export const metadata = { title: "Neues Passwort" };

export default function PasswortNeuPage() {
  return (
    <>
      <AuthBrand subtitle="Fast fertig – vergib dein neues Passwort." />
      <PasswortNeuForm />
    </>
  );
}
