import { Bell } from "lucide-react";
import { Card } from "@/components/ui";

export const metadata = { title: "Benachrichtigungen" };

export default function BenachrichtigungenPage() {
  return (
    <>
      <h1 className="mb-3.5 flex items-center gap-2 text-xl font-black text-creme">
        <Bell size={20} className="text-gold" /> Benachrichtigungen
      </h1>
      <Card>
        <div className="text-center text-sm text-muted">
          Noch keine Benachrichtigungen. Sobald was passiert, klingelt&apos;s hier. 🔔
        </div>
      </Card>
      <p className="mt-3 text-center text-xs text-muted">
        In-App-Liste &amp; Web Push kommen in M7 (Politur).
      </p>
    </>
  );
}
