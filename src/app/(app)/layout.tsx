import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { getIsAdmin } from "@/lib/user";

// Die eingeloggte App ist personalisiert (Session) – immer pro Request rendern.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await getIsAdmin();
  return (
    <PhoneFrame>
      <AppHeader isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto p-3.5 pb-[90px]">{children}</main>
      <BottomNav />
    </PhoneFrame>
  );
}
