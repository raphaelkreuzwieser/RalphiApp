import { AuthBrand } from "@/components/auth/AuthBrand";
import { AGE_NOTICE } from "@/lib/assets";
import { getActiveCountries } from "@/lib/countries";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Registrieren" };
export const dynamic = "force-dynamic";

/** YYYY-MM-DD von heute minus 18 Jahren (max-Wert des Datumsfelds). */
function maxBirthdate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export default async function RegistrierenPage() {
  const countries = await getActiveCountries();
  return (
    <>
      <AuthBrand subtitle="Registrieren – ab 18. Willkommen in der Familie! 😘" />
      <RegisterForm countries={countries} maxBirthdate={maxBirthdate()} />
      <div className="mt-8 text-center text-[11px] text-muted">{AGE_NOTICE}</div>
    </>
  );
}
