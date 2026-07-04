import { Search } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

export const metadata = { title: "Freunde" };

export default function FreundePage() {
  return (
    <>
      <div className="relative mb-3.5">
        <Search size={16} className="absolute left-3 top-3.5 text-muted" />
        <input
          className="w-full rounded-[10px] border border-line bg-panel2 py-3 pl-9 pr-3 text-[15px] text-creme placeholder:text-muted"
          placeholder="User suchen & Anfrage senden…"
          disabled
        />
      </div>

      <SectionTitle>Meine Freunde</SectionTitle>
      <Card>
        <div className="text-center text-sm text-muted">
          Noch keine Freunde – such wen und schick eine Anfrage! 🤝
        </div>
      </Card>

      <p className="mt-3 text-center text-xs text-muted">
        User-Suche, Anfragen, Bestzeiten &amp; Blockieren kommen in M6 (Social).
      </p>
    </>
  );
}
