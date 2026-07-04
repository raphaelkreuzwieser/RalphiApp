import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-3.5 pb-[90px]">{children}</main>
      <BottomNav />
    </PhoneFrame>
  );
}
