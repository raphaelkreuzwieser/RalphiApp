"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Card, Btn } from "@/components/ui";
import { searchUsernames, transferEventAdmin } from "../actions";

export function TransferAdmin({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; username: string; country_id: string }[]>([]);
  const [searching, startSearch] = useTransition();
  const [busy, startTransfer] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doSearch(value: string) {
    setQ(value);
    setError(null);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    startSearch(async () => setResults(await searchUsernames(value)));
  }

  function transfer(id: string, username: string) {
    if (!confirm(`Event-Admin an @${username} übertragen?`)) return;
    setError(null);
    startTransfer(async () => {
      const res = await transferEventAdmin(eventId, id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <Card className="mt-3.5">
      <div className="mb-2 text-xs font-bold text-muted">EVENT-ADMIN ÜBERTRAGEN</div>
      {error && (
        <div className="mb-2.5 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-2.5 text-[13px] text-creme">
          {error}
        </div>
      )}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-muted" />
        <input
          className="w-full rounded-[10px] border border-line bg-panel2 py-3 pl-9 pr-3 text-[15px] text-creme placeholder:text-muted focus:border-rot focus:outline-none"
          placeholder="Registrierten User suchen…"
          value={q}
          onChange={(e) => doSearch(e.target.value)}
        />
        {searching && <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-muted" />}
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {results.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-lg bg-panel2 px-3 py-2">
            <span className="text-sm text-creme">
              @{u.username} <span className="text-xs text-muted">{u.country_id}</span>
            </span>
            <Btn className="px-3 py-1.5 text-xs" disabled={busy} onClick={() => transfer(u.id, u.username)}>
              Übertragen
            </Btn>
          </div>
        ))}
      </div>
    </Card>
  );
}
