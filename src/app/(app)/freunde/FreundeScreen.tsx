"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, X, Ban, Loader2, UserPlus } from "lucide-react";
import { Card, Btn, Avatar, SectionTitle } from "@/components/ui";
import { LedTime } from "@/components/LedTime";
import { searchUsernames } from "../events/actions";
import {
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
  blockUser,
  type FriendState,
} from "./actions";
import type { IncomingRequest, FriendEntry } from "@/lib/social";

export function FreundeScreen({
  incoming,
  friends,
}: {
  incoming: IncomingRequest[];
  friends: FriendEntry[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ id: string; username: string; country_id: string }[]>([]);
  const [searching, startSearch] = useTransition();
  const [busy, startBusy] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function doSearch(value: string) {
    setQ(value);
    setError(null);
    setInfo(null);
    if (value.trim().length < 2) return setResults([]);
    startSearch(async () => setResults(await searchUsernames(value)));
  }

  function act(action: () => Promise<FriendState>, okMsg?: string) {
    setError(null);
    setInfo(null);
    startBusy(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else {
        if (okMsg) setInfo(okMsg);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="relative mb-3.5">
        <Search size={16} className="absolute left-3 top-3.5 text-muted" />
        <input
          className="w-full rounded-[10px] border border-line bg-panel2 py-3 pl-9 pr-3 text-[15px] text-creme placeholder:text-muted focus:border-rot focus:outline-none"
          placeholder="User suchen & Anfrage senden…"
          value={q}
          onChange={(e) => doSearch(e.target.value)}
        />
        {searching && <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-muted" />}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3 rounded-xl border border-[#2C5C40] bg-[rgba(123,224,163,0.1)] p-3 text-[13px] text-creme">
          {info}
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {results.map((u) => (
            <Card key={u.id} className="flex items-center justify-between">
              <div className="text-sm font-bold text-creme">
                @{u.username} <span className="text-xs text-muted">{u.country_id}</span>
              </div>
              <Btn
                className="px-3 py-1.5 text-xs"
                disabled={busy}
                onClick={() => act(() => sendFriendRequest(u.id), `Anfrage an @${u.username} gesendet 🤝`)}
              >
                <UserPlus size={13} /> Anfrage
              </Btn>
            </Card>
          ))}
        </div>
      )}

      {incoming.length > 0 && (
        <>
          <SectionTitle>Anfragen ({incoming.length})</SectionTitle>
          {incoming.map((r) => (
            <Card key={r.friendshipId} className="mb-2 flex items-center justify-between">
              <div className="font-bold text-creme">@{r.username}</div>
              <div className="flex gap-1.5">
                <Btn className="px-3 py-1.5 text-xs" disabled={busy}
                  onClick={() => act(() => respondFriendRequest(r.friendshipId, true), `@${r.username} ist jetzt dein Freund 🎉`)}>
                  <Check size={13} />
                </Btn>
                <Btn kind="ghost" className="px-3 py-1.5 text-xs" disabled={busy}
                  onClick={() => act(() => respondFriendRequest(r.friendshipId, false))}>
                  <X size={13} />
                </Btn>
              </div>
            </Card>
          ))}
        </>
      )}

      <SectionTitle>Meine Freunde ({friends.length})</SectionTitle>
      {friends.length === 0 ? (
        <Card>
          <div className="text-center text-sm text-muted">
            Noch keine Freunde – such wen und schick eine Anfrage! 🤝
          </div>
        </Card>
      ) : (
        friends.map((f) => (
          <Card key={f.friendshipId} className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={f.username} size={38} />
              <div>
                <div className="font-bold text-creme">@{f.username}</div>
                <div className="flex items-center gap-1 text-[13px]">
                  <span>🏁</span>
                  <LedTime seconds={f.bestTime} size="sm" withUnit className="text-[13px]" />
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Btn kind="ghost" className="px-2.5 py-1.5 text-[11px]" disabled={busy}
                onClick={() => act(() => removeFriend(f.friendshipId), `@${f.username} entfernt`)}>
                Entfernen
              </Btn>
              <Btn kind="danger" className="px-2.5 py-1.5 text-[11px]" disabled={busy}
                onClick={() => act(() => blockUser(f.userId), `@${f.username} blockiert`)}>
                <Ban size={12} />
              </Btn>
            </div>
          </Card>
        ))
      )}
    </>
  );
}
