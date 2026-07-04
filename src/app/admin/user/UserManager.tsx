"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Trash2 } from "lucide-react";
import { Card, Btn, Tag, SectionTitle } from "@/components/ui";
import { formatSeconds } from "@/lib/format";
import { toggleUserLock, deleteUser, type AdminState } from "../actions";

export interface UserRow {
  id: string;
  username: string;
  fullName: string;
  countryId: string;
  locked: boolean;
  bestTime: number | null;
}

export function UserManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
      <SectionTitle>User-Management</SectionTitle>
      {error && (
        <div className="mb-3 rounded-xl border border-rot-dark bg-[rgba(232,40,60,0.12)] p-3 text-[13px] text-creme">
          {error}
        </div>
      )}

      {users.length === 0 && (
        <Card>
          <div className="text-center text-muted">Noch keine User.</div>
        </Card>
      )}

      {users.map((u) => (
        <Card key={u.id} className="mb-2">
          <div className="flex items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 font-bold text-creme">
                @{u.username}
                {u.locked && (
                  <Tag color="text-rot" border="border-rot-dark">
                    GESPERRT
                  </Tag>
                )}
              </div>
              <div className="text-xs text-muted">
                {u.fullName} · {u.countryId} · Bestzeit:{" "}
                <span className="text-gold">{formatSeconds(u.bestTime)}</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Btn
                kind="ghost"
                className="px-2.5 py-1.5 text-xs"
                disabled={pending}
                onClick={() => run(() => toggleUserLock(u.id, !u.locked))}
              >
                <Ban size={13} /> {u.locked ? "Entsperren" : "Sperren"}
              </Btn>
              {confirmId === u.id ? (
                <Btn
                  kind="danger"
                  className="px-2.5 py-1.5 text-xs"
                  disabled={pending}
                  onClick={() => run(() => deleteUser(u.id), () => setConfirmId(null))}
                >
                  Wirklich löschen?
                </Btn>
              ) : (
                <Btn
                  kind="danger"
                  className="px-2.5 py-1.5 text-xs"
                  onClick={() => setConfirmId(u.id)}
                >
                  <Trash2 size={13} />
                </Btn>
              )}
            </div>
          </div>
        </Card>
      ))}
      <p className="mt-2 text-[11px] text-muted">
        Der echte Name ist ausschließlich hier im Admin sichtbar. Löschen entfernt den User
        inkl. aller Daten (Kaskade in der DB).
      </p>
    </>
  );
}
