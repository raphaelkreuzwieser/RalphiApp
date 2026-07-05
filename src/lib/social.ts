import { createClient, createAdminClient } from "@/lib/supabase/server";

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
function adminOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

export interface IncomingRequest {
  friendshipId: string;
  userId: string;
  username: string;
  countryId: string;
}
export interface FriendEntry {
  friendshipId: string;
  userId: string;
  username: string;
  bestTime: number | null;
}
export interface FriendsData {
  incoming: IncomingRequest[];
  friends: FriendEntry[];
}

/**
 * Freundes-Daten des aktuellen Users. Usernamen fremder Profile werden
 * serverseitig über den Service-Role-Key aufgelöst – aber NUR für Personen,
 * mit denen bereits eine Freundschaft/Anfrage besteht (RLS-Zeilen des Users).
 */
export async function getFriendsData(): Promise<FriendsData> {
  const empty: FriendsData = { incoming: [], friends: [] };
  if (!hasEnv()) return empty;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    // RLS liefert nur Zeilen, an denen der User beteiligt ist.
    const { data: rows } = await supabase
      .from("friendships")
      .select("id, requester, addressee, status");
    if (!rows) return empty;

    const incomingRows = rows.filter(
      (r: any) => r.status === "pending" && r.addressee === user.id,
    );
    const friendRows = rows.filter((r: any) => r.status === "accepted");

    const otherId = (r: any) => (r.requester === user.id ? r.addressee : r.requester);
    const ids = Array.from(
      new Set([...incomingRows.map((r: any) => r.requester), ...friendRows.map(otherId)]),
    );

    const admin = adminOrNull();
    const nameMap = new Map<string, { username: string; countryId: string }>();
    if (admin && ids.length) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, username, country_id")
        .in("id", ids);
      (profiles ?? []).forEach((p: any) =>
        nameMap.set(p.id, { username: p.username, countryId: p.country_id }),
      );
    }

    // Bestzeiten der Freunde (best_time ist security-definer).
    const friendIds = friendRows.map(otherId);
    const bestTimes = new Map<string, number | null>();
    await Promise.all(
      friendIds.map(async (fid: string) => {
        const { data } = await supabase.rpc("best_time", { uid: fid });
        bestTimes.set(fid, typeof data === "number" ? data : null);
      }),
    );

    return {
      incoming: incomingRows.map((r: any) => ({
        friendshipId: r.id,
        userId: r.requester,
        username: nameMap.get(r.requester)?.username ?? "?",
        countryId: nameMap.get(r.requester)?.countryId ?? "",
      })),
      friends: friendRows.map((r: any) => {
        const oid = otherId(r);
        return {
          friendshipId: r.id,
          userId: oid,
          username: nameMap.get(oid)?.username ?? "?",
          bestTime: bestTimes.get(oid) ?? null,
        };
      }),
    };
  } catch {
    return empty;
  }
}

export interface FeedReaction {
  username: string;
  text: string;
}
export interface FeedEntry {
  id: string;
  userId: string;
  username: string;
  bestTime: number | null;
  drinkName: string;
  drinkImage: string | null;
  locationText: string | null;
  createdAt: string;
  reactions: FeedReaction[];
}

/**
 * Check-in-Feed: pro bestätigtem Freund der jeweils NEUESTE Check-in.
 * RLS auf checkins erlaubt Lesen nur für Freunde – das Frontend zeigt zusätzlich
 * nur den letzten pro Freund.
 */
export async function getCheckinFeed(): Promise<FeedEntry[]> {
  if (!hasEnv()) return [];
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // RLS: liefert eigene + Freundes-Check-ins. Neueste zuerst.
    const { data: checkins } = await supabase
      .from("checkins")
      .select("id, user_id, drink_id, drink_name, location_text, created_at")
      .order("created_at", { ascending: false });
    if (!checkins) return [];

    // Nur Freunde (nicht der eigene) und je Freund nur der neueste.
    const seen = new Set<string>();
    const latest = checkins.filter((c: any) => {
      if (c.user_id === user.id || seen.has(c.user_id)) return false;
      seen.add(c.user_id);
      return true;
    });
    if (latest.length === 0) return [];

    const admin = adminOrNull();
    const userIds = Array.from(new Set(latest.map((c: any) => c.user_id)));
    const nameMap = new Map<string, string>();
    if (admin && userIds.length) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
      (profiles ?? []).forEach((p: any) => nameMap.set(p.id, p.username));
    }

    // Getränkebilder
    const drinkIds = latest.map((c: any) => c.drink_id).filter(Boolean);
    const imgMap = new Map<string, string | null>();
    if (drinkIds.length) {
      const { data: drinks } = await supabase
        .from("drinks")
        .select("id, image_url")
        .in("id", drinkIds);
      (drinks ?? []).forEach((d: any) => imgMap.set(d.id, d.image_url));
    }

    // Bestzeiten
    const bestTimes = new Map<string, number | null>();
    await Promise.all(
      userIds.map(async (uid: string) => {
        const { data } = await supabase.rpc("best_time", { uid });
        bestTimes.set(uid, typeof data === "number" ? data : null);
      }),
    );

    // Reaktionen je Check-in
    const checkinIds = latest.map((c: any) => c.id);
    const reactionsByCheckin = new Map<string, FeedReaction[]>();
    if (checkinIds.length) {
      const { data: reacts } = await supabase
        .from("checkin_reactions")
        .select("checkin_id, user_id, text, created_at")
        .in("checkin_id", checkinIds)
        .order("created_at", { ascending: true });
      const reactorIds = Array.from(new Set((reacts ?? []).map((r: any) => r.user_id)));
      const reactorNames = new Map<string, string>();
      if (admin && reactorIds.length) {
        const { data: rp } = await admin
          .from("profiles")
          .select("id, username")
          .in("id", reactorIds);
        (rp ?? []).forEach((p: any) => reactorNames.set(p.id, p.username));
      }
      (reacts ?? []).forEach((r: any) => {
        const arr = reactionsByCheckin.get(r.checkin_id) ?? [];
        arr.push({ username: reactorNames.get(r.user_id) ?? "?", text: r.text });
        reactionsByCheckin.set(r.checkin_id, arr);
      });
    }

    return latest.map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      username: nameMap.get(c.user_id) ?? "?",
      bestTime: bestTimes.get(c.user_id) ?? null,
      drinkName: c.drink_name,
      drinkImage: c.drink_id ? imgMap.get(c.drink_id) ?? null : null,
      locationText: c.location_text,
      createdAt: c.created_at,
      reactions: reactionsByCheckin.get(c.id) ?? [],
    }));
  } catch {
    return [];
  }
}
