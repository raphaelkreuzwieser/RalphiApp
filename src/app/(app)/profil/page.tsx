import { getCurrentProfile } from "@/lib/user";
import { ProfileScreen } from "./ProfileScreen";

export const metadata = { title: "Mehr" };
// Muss pro Request laufen (liest die Session) – nicht statisch vorrendern.
export const dynamic = "force-dynamic";

function formatMemberSince(iso: string | undefined): string {
  if (!iso) return "Juli 2026";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Juli 2026";
  return d.toLocaleDateString("de-AT", { month: "long", year: "numeric" });
}

export default async function ProfilPage() {
  const current = await getCurrentProfile();

  // Middleware schützt /profil – ohne Session (bzw. ohne Env) Fallback-Anzeige.
  const username = current?.profile.username ?? "Gast";
  const countryLabel = current?.countryLabel ?? "🇦🇹 Österreich";
  const memberSince = formatMemberSince(current?.profile.created_at);
  const bestTime = current?.bestTime ?? null;
  const shareLocation = current?.profile.share_location ?? true;

  return (
    <ProfileScreen
      username={username}
      countryLabel={countryLabel}
      memberSince={memberSince}
      bestTime={bestTime}
      shareLocation={shareLocation}
    />
  );
}
