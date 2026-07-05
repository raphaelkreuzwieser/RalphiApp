import { Bell } from "lucide-react";
import { Card } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { getNotifications } from "@/lib/notifications";
import { MarkRead } from "./MarkRead";

export const metadata = { title: "Benachrichtigungen" };
export const dynamic = "force-dynamic";

export default async function BenachrichtigungenPage() {
  const items = await getNotifications();
  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <MarkRead hasUnread={hasUnread} />
      <h1 className="mb-3.5 flex items-center gap-2 text-xl font-black text-creme">
        <Bell size={20} className="text-gold" /> Benachrichtigungen
      </h1>

      {items.length === 0 ? (
        <Card>
          <div className="text-center text-sm text-muted">
            Noch keine Benachrichtigungen. Sobald was passiert, klingelt&apos;s hier. 🔔
          </div>
        </Card>
      ) : (
        items.map((n) => (
          <Card
            key={n.id}
            className={`mb-2 flex items-start gap-3 ${!n.read ? "!border-rot" : ""}`}
          >
            <div className="text-xl">{n.emoji}</div>
            <div className="flex-1">
              <div className="text-sm text-creme">{n.text}</div>
              <div className="mt-0.5 text-[11px] text-muted">{relativeTime(n.createdAt)}</div>
            </div>
            {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-rot" />}
          </Card>
        ))
      )}
    </>
  );
}
