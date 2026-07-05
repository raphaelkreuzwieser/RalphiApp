"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, Btn, SectionTitle } from "@/components/ui";
import { createReaction, deleteReaction, type AdminState } from "../actions";

export interface ReactionRow {
  id: string;
  text: string;
  active: boolean;
}

export function AntwortenManager({ reactions }: { reactions: ReactionRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");

  function run(action: () => Promise<AdminState>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <>
      <SectionTitle>Vordefinierte Check-in-Reaktionen</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {reactions.map((r) => (
        <Card key={r.id} className="mb-2 flex items-center justify-between gap-2.5">
          <div className="text-sm text-creme">{r.text}</div>
          <button
            aria-label="Löschen"
            className="text-muted"
            disabled={pending}
            onClick={() => run(() => deleteReaction(r.id))}
          >
            <Trash2 size={16} />
          </button>
        </Card>
      ))}

      <div className="mt-2.5 flex gap-2">
        <input
          className="flex-1 rounded-[10px] border border-line bg-panel2 p-3 text-[15px] text-creme placeholder:text-muted focus:border-rot focus:outline-none"
          placeholder="Neue Antwort…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Btn
          className="px-3 py-2"
          disabled={pending || !text.trim()}
          onClick={() => run(() => createReaction(text), () => setText(""))}
        >
          <Plus size={16} />
        </Btn>
      </div>
    </>
  );
}
