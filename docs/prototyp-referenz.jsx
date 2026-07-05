import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Timer, Trophy, GlassWater, Users, Menu, Shield, Play, Check, X,
  Plus, Trash2, Globe, Bell, MapPin, Heart, Upload, Video, Download,
  MessageCircle, Eye, EyeOff, ExternalLink, ShoppingBag, LogOut, Ban,
  Search, ChevronLeft, Loader2, Zap
} from "lucide-react";

/* ============================================================
   GSCHPUSI SHOTRACE – Web-App (mobile-first)
   Echte Produktgrafiken via Shopify CDN · geteilte Persistenz
   Party-Shot GmbH · Gschpusi – Home of Partydrinks
   ============================================================ */

const CDN = "https://cdn.shopify.com/s/files/1/0857/9786/3752/files/";
const LOGO = CDN + "Gschpusi_Home-of-Partydrinks_Basic_Claim_Logo_2026.png?v=1781449017";
const LOGO_RACER = CDN + "Gschpusi-Racer_RGB.png?v=1781606602";

const IMG = {
  kirsch: CDN + "Gschpusi_Kirsch.png?v=1730822124",
  ice: CDN + "Gschpusi_Ice.png?v=1730822064",
  feige: CDN + "Gschpusi_Feige.png?v=1730820854",
  kraeuter: CDN + "Gschpusi_Kraeuter_0.png?v=1730822213",
  sauer: CDN + "Gschpusi_Sauer.png?v=1731409662",
  sahne: CDN + "Gschpusi-Sahne_Flasche.png?v=1781450147",
  willi: CDN + "WilliFlasche.png?v=1730824361",
  espresso: CDN + "Gschpusi_Espresso.png?v=1781450148",
  skiwasser: CDN + "Dose_SKIWASSER.png?v=1781449601",
  holunder: CDN + "Dose_HOLUNDER.png?v=1781449601",
  lemon: CDN + "Dose_LEMON_afce43ad-63fc-4f4f-9006-c6f5ce84253c.png?v=1781449602",
  gspritzter: CDN + "Dose_GSPRITZER_kl.png?v=1781449601",
  somma: CDN + "Dose_SOMMA-SPRIZZA_kl.png?v=1781449601",
};

const C = {
  bg: "#160A0E", panel: "#241218", panel2: "#2E171F", line: "#42222C",
  red: "#E8283C", redDark: "#B01528", pink: "#FF8FA3", gold: "#FFB347",
  cream: "#FFF3EE", mut: "#B98E97",
};

const led = {
  fontFamily: "'Courier New', ui-monospace, monospace", fontWeight: 700,
  letterSpacing: "0.06em", color: C.gold,
  textShadow: "0 0 12px rgba(255,179,71,0.55)", fontVariantNumeric: "tabular-nums",
};

const fmtTime = (s) => (typeof s === "number" ? s.toFixed(2).replace(".", ",") + " s" : "– –");
const STORAGE_KEY = "shotrace-app-v1";

/* ---------------- Startdaten ---------------- */
const seed = {
  countries: [
    { id: "AT", name: "Österreich", flag: "🇦🇹", active: true },
    { id: "DE", name: "Deutschland", flag: "🇩🇪", active: true },
    { id: "IT", name: "Italien", flag: "🇮🇹", active: true },
  ],
  subs: [
    { id: 1, user: "AlmRakete", land: "AT", zeit: 3.42, status: "approved", videoPublic: true, datum: "28.06.2026" },
    { id: 2, user: "BussiBaronin", land: "AT", zeit: 3.87, status: "approved", videoPublic: false, datum: "29.06.2026" },
    { id: 3, user: "WelsRakete", land: "AT", zeit: 4.11, status: "approved", videoPublic: false, datum: "30.06.2026" },
    { id: 4, user: "BavarianBlitz", land: "DE", zeit: 3.66, status: "approved", videoPublic: true, datum: "27.06.2026" },
    { id: 5, user: "SuedtirolSepp", land: "IT", zeit: 3.95, status: "approved", videoPublic: false, datum: "26.06.2026" },
    { id: 6, user: "SchnapsHansi", land: "AT", zeit: 4.05, status: "approved", videoPublic: false, datum: "01.07.2026" },
    { id: 7, user: "TirolTornado", land: "AT", zeit: 5.02, status: "pending", videoPublic: false, datum: "03.07.2026" },
  ],
  drinks: [
    { name: "Shot Kirsch", img: IMG.kirsch }, { name: "Shot Ice", img: IMG.ice },
    { name: "Shot Feige", img: IMG.feige }, { name: "Shot Kräuter", img: IMG.kraeuter },
    { name: "Shot Sauer", img: IMG.sauer }, { name: "Shot Sahne", img: IMG.sahne },
    { name: "Shot Willi", img: IMG.willi }, { name: "Espresso Martini", img: IMG.espresso },
    { name: "Skiwasser mit Schuss", img: IMG.skiwasser }, { name: "Holunder mit Schuss", img: IMG.holunder },
    { name: "Lemon Ice mit Schuss", img: IMG.lemon }, { name: "Gspritzter", img: IMG.gspritzter },
    { name: "Somma Sprizza", img: IMG.somma },
  ],
  reactions: ["Ich komm vorbei! 🏃", "Trinkst du schon wieder ohne mich? 😤", "Prost! 🥂", "Bussi! 😘", "Ohne mich fang ned an!"],
  checkins: [
    { id: 1, user: "BussiBaronin", drink: "Espresso Martini", ort: "Aruba Bar, Wels", zeit: "vor 12 min", reactions: [{ user: "AlmRakete", text: "Ich komm vorbei! 🏃" }] },
    { id: 2, user: "AlmRakete", drink: "Shot Kirsch", ort: "Salzburgring, Plainfeld", zeit: "vor 1 h", reactions: [] },
    { id: 3, user: "WelsRakete", drink: "Skiwasser mit Schuss", ort: "Stadtplatz, Wels", zeit: "vor 3 h", reactions: [{ user: "BussiBaronin", text: "Prost! 🥂" }] },
  ],
  friends: ["BussiBaronin", "AlmRakete", "WelsRakete"],
  requests: ["TirolTornado", "SuedtirolSepp"],
  users: [
    { user: "SchnapsHansi", name: "Hans Demo", land: "AT", locked: false },
    { user: "AlmRakete", name: "Anna Demo", land: "AT", locked: false },
    { user: "BussiBaronin", name: "Berta Demo", land: "AT", locked: false },
    { user: "WelsRakete", name: "Willi Demo", land: "AT", locked: false },
    { user: "BavarianBlitz", name: "Bernd Demo", land: "DE", locked: false },
    { user: "SuedtirolSepp", name: "Sepp Demo", land: "IT", locked: false },
    { user: "TirolTornado", name: "Toni Demo", land: "AT", locked: false },
  ],
  events: [
    { id: "ev1", name: "Beachparty XXL – Wels", admin: "BussiBaronin", datum: "04.07.2026" },
    { id: "ev2", name: "Electric Love Warm-up", admin: "SchnapsHansi", datum: "08.07.2026" },
  ],
  eventSubs: [
    { id: 101, eventId: "ev1", user: "WelsRakete", zeit: 4.44, video: false, status: "confirmed" },
    { id: 102, eventId: "ev1", user: "BussiBaronin", zeit: 4.02, video: true, status: "confirmed" },
    { id: 103, eventId: "ev1", user: "TirolTornado", zeit: 4.8, video: false, status: "pending" },
    { id: 104, eventId: "ev2", user: "AlmRakete", zeit: 3.77, video: true, status: "pending" },
  ],
};

/* ---------------- Bausteine ---------------- */
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, kind = "primary", style, disabled }) => {
  const kinds = {
    primary: { background: C.red, color: "#fff", boxShadow: "0 4px 18px rgba(232,40,60,0.35)" },
    ghost: { background: "transparent", color: C.cream, border: `1px solid ${C.line}` },
    gold: { background: C.gold, color: "#3A2200" },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.redDark}` },
    soft: { background: C.panel2, color: C.cream },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: 14,
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1,
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: "inherit", ...kinds[kind], ...style,
    }}>{children}</button>
  );
};

const Tag = ({ children, color = C.mut, border = C.line }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, border: `1px solid ${border}`, borderRadius: 99, padding: "3px 9px", whiteSpace: "nowrap" }}>{children}</span>
);

const StatusTag = ({ s }) => s === "approved"
  ? <Tag color="#7BE0A3" border="#2C5C40">FREIGEGEBEN</Tag>
  : s === "pending" ? <Tag color={C.gold} border="#6B4E1E">PENDING</Tag>
  : <Tag color={C.red} border={C.redDark}>ABGELEHNT</Tag>;

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: C.panel2, color: C.cream,
  border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px", fontSize: 15, fontFamily: "inherit",
};

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.mut, margin: "18px 2px 10px" }}>{children}</div>
);

const Avatar = ({ name, size = 40 }) => (
  <div style={{ width: size, height: size, minWidth: size, borderRadius: 99, background: `linear-gradient(135deg, ${C.red}, ${C.pink})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: size * 0.4 }}>{name[0]}</div>
);

const DrinkImg = ({ src, size = 44 }) => src ? (
  <div style={{ width: size, height: size, minWidth: size, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <img src={src} alt="" style={{ maxWidth: "82%", maxHeight: "88%", objectFit: "contain" }} />
  </div>
) : (
  <div style={{ width: size, height: size, minWidth: size, borderRadius: 12, background: C.panel2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45 }}>🥃</div>
);

const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} style={{ width: 46, height: 26, borderRadius: 99, border: "none", cursor: "pointer", background: on ? C.red : C.panel2, position: "relative", transition: "background 0.2s" }}>
    <div style={{ width: 20, height: 20, borderRadius: 99, background: "#fff", position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.2s" }} />
  </button>
);

const Toast = ({ msg }) => (
  <div style={{ position: "absolute", top: 14, left: 14, right: 14, zIndex: 100, background: C.panel2, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.red}`, borderRadius: 12, padding: "12px 14px", color: C.cream, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>{msg}</div>
);

const Shell = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#0C0508", display: "flex", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
    <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: C.bg, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>{children}</div>
  </div>
);

const VideoOverlay = ({ entry, onClose }) => (
  <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,4,6,0.88)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340 }}>
      <div style={{ background: "#000", borderRadius: 16, aspectRatio: "9/14", border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 12 }}><Tag color={C.pink} border={C.redDark}>🎬 VIDEO-PLATZHALTER</Tag></div>
        <img src={LOGO_RACER} alt="Shotrace" style={{ width: "60%", opacity: 0.9 }} />
        <div style={{ ...led, fontSize: 34 }}>{fmtTime(entry.zeit)}</div>
        <div style={{ color: C.mut, fontSize: 13 }}>@{entry.user} · Shotrace-Lauf</div>
      </div>
      <Btn kind="ghost" onClick={onClose} style={{ width: "100%", marginTop: 12 }}><X size={16} /> Schließen</Btn>
    </div>
  </div>
);

/* ============================================================ */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(true); // Speicherung verfügbar?
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [tab, setTab] = useState("race");
  const [adminTab, setAdminTab] = useState("moderation");
  const [toast, setToast] = useState(null);

  const [data, setData] = useState(seed);
  const { countries, subs, drinks, reactions, checkins, friends, requests, users, events, eventSubs } = data;
  const set = (patch) => setData((p) => ({ ...p, ...patch }));

  // UI
  const [rankLand, setRankLand] = useState("EU");
  const [rankView, setRankView] = useState("official");
  const [activeEvent, setActiveEvent] = useState(null);
  const [newEventName, setNewEventName] = useState("");
  const [evTime, setEvTime] = useState("");
  const [evVideo, setEvVideo] = useState(false);
  const [evSubmitOpen, setEvSubmitOpen] = useState(false);
  const [videoEntry, setVideoEntry] = useState(null);
  const [submitStep, setSubmitStep] = useState(0);
  const [newTime, setNewTime] = useState("");
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [selDrink, setSelDrink] = useState(null);
  const [customDrink, setCustomDrink] = useState("");
  const [shareLoc, setShareLoc] = useState(true);
  const [reactTarget, setReactTarget] = useState(null);
  const [freeText, setFreeText] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newDrink, setNewDrink] = useState("");
  const [newReaction, setNewReaction] = useState("");
  const [modFilter, setModFilter] = useState("pending");

  const me = "SchnapsHansi";
  const loadedRef = useRef(false);

  const showToast = (m) => setToast(m);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  /* ---- Persistenz: laden ---- */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY, true);
        if (r?.value) setData({ ...seed, ...JSON.parse(r.value) });
      } catch (e) { /* Key existiert noch nicht – Startdaten verwenden */ }
      finally { loadedRef.current = true; setLoading(false); }
    })().catch(() => { setShared(false); loadedRef.current = true; setLoading(false); });
  }, []);

  /* ---- Persistenz: speichern (debounced) ---- */
  useEffect(() => {
    if (!loadedRef.current) return;
    const t = setTimeout(async () => {
      try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), true); }
      catch (e) { setShared(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [data]);

  /* ---- Abgeleitete Werte ---- */
  const bestOf = (u) => {
    const t = subs.filter((s) => s.user === u && s.status === "approved").map((s) => s.zeit);
    return t.length ? Math.min(...t) : null;
  };
  const ranking = useMemo(() => {
    const a = subs.filter((s) => s.status === "approved");
    const l = rankLand === "EU" ? a : a.filter((s) => s.land === rankLand);
    return [...l].sort((x, y) => x.zeit - y.zeit);
  }, [subs, rankLand]);
  const bestTime = useMemo(() => {
    const a = subs.filter((s) => s.status === "approved");
    return a.length ? Math.min(...a.map((s) => s.zeit)) : null;
  }, [subs]);
  const drinkImg = (name) => drinks.find((d) => d.name === name)?.img;

  /* ---- Aktionen ---- */
  const submitRun = () => {
    const z = parseFloat(newTime.replace(",", "."));
    if (!z || z <= 0) { showToast("Bitte gültige Zeit eintragen"); return; }
    set({ subs: [...subs, { id: Date.now(), user: me, land: "AT", zeit: z, status: "pending", videoPublic: false, datum: new Date().toLocaleDateString("de-AT") }] });
    setSubmitStep(0); setNewTime("");
    showToast("Lauf eingereicht – Status: Pending ⏳");
  };
  const moderate = (id, status) => {
    set({ subs: subs.map((s) => (s.id === id ? { ...s, status } : s)) });
    showToast(status === "approved" ? "Freigegeben ✅ – Ranking aktualisiert" : "Abgelehnt ❌");
  };
  const doCheckin = () => {
    const drink = selDrink === "__custom" ? customDrink.trim() : selDrink;
    if (!drink) { showToast("Bitte Getränk wählen"); return; }
    set({ checkins: [{ id: Date.now(), user: me, drink, ort: shareLoc ? "Traunufer-Arkade 1, Thalheim bei Wels" : "Standort nicht geteilt", zeit: "gerade eben", reactions: [] }, ...checkins.filter((c) => c.user !== me)] });
    setCheckinOpen(false); setSelDrink(null); setCustomDrink("");
    showToast("Eingecheckt! Deine Freunde sehen's jetzt 😘");
  };
  const sendReaction = (cid, text) => {
    if (!text.trim()) return;
    set({ checkins: checkins.map((c) => (c.id === cid ? { ...c, reactions: [...c.reactions, { user: me, text }] } : c)) });
    setReactTarget(null); setFreeText("");
    showToast("🔔 Push an den User: neue Reaktion!");
  };
  const createEvent = () => {
    if (!newEventName.trim()) { showToast("Bitte Namen eingeben"); return; }
    const ev = { id: "ev" + Date.now(), name: newEventName.trim(), admin: me, datum: new Date().toLocaleDateString("de-AT") };
    set({ events: [...events, ev] });
    setNewEventName(""); setActiveEvent(ev.id);
    showToast("Challenge erstellt – du bist Event-Admin 🎉");
  };
  const submitEventRun = () => {
    const z = parseFloat(evTime.replace(",", "."));
    if (!z || z <= 0) { showToast("Bitte gültige Zeit eintragen"); return; }
    set({ eventSubs: [...eventSubs, { id: Date.now(), eventId: activeEvent, user: me, zeit: z, video: evVideo, status: "pending" }] });
    setEvTime(""); setEvVideo(false); setEvSubmitOpen(false);
    showToast("Zeit eingetragen – wartet auf den Event-Admin ⏳");
  };
  const moderateEventRun = (id, ok) => {
    const sub = eventSubs.find((s) => s.id === id);
    const patch = { eventSubs: eventSubs.map((s) => (s.id === id ? { ...s, status: ok ? "confirmed" : "rejected" } : s)) };
    if (ok && sub?.video) {
      const evName = events.find((e) => e.id === sub.eventId)?.name;
      patch.subs = [...subs, { id: Date.now(), user: sub.user, land: "AT", zeit: sub.zeit, status: "pending", videoPublic: false, datum: new Date().toLocaleDateString("de-AT"), via: evName }];
    }
    set(patch);
    showToast(ok ? (sub?.video ? "Bestätigt ✅ – geht mit Videobeweis zur offiziellen Prüfung" : "Bestätigt ✅ – im Event-Ranking") : "Abgelehnt ❌");
  };
  const exportCSV = () => {
    const rows = [["Platz", "Username", "Land", "Zeit", "Status"],
      ...subs.filter((s) => s.status === "approved").sort((a, b) => a.zeit - b.zeit)
        .map((s, i) => [i + 1, s.user, s.land, s.zeit.toFixed(2), s.status])];
    const blob = new Blob([rows.map((r) => r.join(";")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "shotrace-ranking.csv"; a.click();
    showToast("CSV exportiert 📊");
  };

  /* ============ LADEN ============ */
  if (loading) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <img src={LOGO} alt="Gschpusi" style={{ width: 180 }} />
          <Loader2 size={26} color={C.red} style={{ animation: "spin 1s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      </Shell>
    );
  }

  /* ============ LOGIN ============ */
  if (!loggedIn) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%", padding: "40px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "14px 18px", display: "inline-block", marginBottom: 14 }}>
              <img src={LOGO} alt="Gschpusi – Home of Partydrinks" style={{ width: 190, display: "block" }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.cream, letterSpacing: "-0.02em" }}>SHOT<span style={{ color: C.red }}>RACE</span></div>
            <div style={{ color: C.mut, fontSize: 14, marginTop: 4 }}>Wie schnell bist du? Beweis es. 🏁</div>
            <div style={{ ...led, fontSize: 40, marginTop: 16 }}>{bestTime ? fmtTime(bestTime).replace(" s", "") : "--,--"}</div>
            <div style={{ fontSize: 11, color: C.mut, letterSpacing: "0.15em", marginTop: 2 }}>AKTUELLER EUROPAREKORD (SEK.)</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mut, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>E-Mail oder Username</div>
            <input style={inputStyle} placeholder="schnapshansi" readOnly />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mut, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Passwort</div>
            <input style={inputStyle} type="password" value="demo1234" readOnly />
          </div>
          <Btn onClick={() => { setLoggedIn(true); showToast("Willkommen zurück, SchnapsHansi! 😘"); }} style={{ width: "100%" }}>Anmelden</Btn>
          <div style={{ textAlign: "center", marginTop: 16, color: C.mut, fontSize: 13 }}>
            Neu hier? <span style={{ color: C.pink, fontWeight: 700 }}>Registrieren</span> · Passwort vergessen?
          </div>
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: C.mut }}>
            🔞 18+ · Enjoy responsibly · Verantwortungsvoller Umgang mit Alkohol liegt uns am Herzen
          </div>
        </div>
        {toast && <Toast msg={toast} />}
      </Shell>
    );
  }

  /* ============ ADMIN ============ */
  if (adminMode) {
    const filtered = subs.filter((s) => (modFilter === "alle" ? true : s.status === modFilter));
    const approved = subs.filter((s) => s.status === "approved");
    const avg = approved.length ? approved.reduce((a, s) => a + s.zeit, 0) / approved.length : 0;
    const byLand = countries.map((c) => ({ ...c, n: subs.filter((s) => s.land === c.id).length }));
    const maxN = Math.max(...byLand.map((b) => b.n), 1);

    return (
      <Shell>
        <header style={{ padding: "14px 16px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.panel }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Shield size={18} color={C.gold} />
            <div style={{ fontWeight: 900, color: C.cream }}>ADMIN <span style={{ color: C.gold }}>DASHBOARD</span></div>
          </div>
          <Btn kind="ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setAdminMode(false)}><ChevronLeft size={14} /> Zur App</Btn>
        </header>
        <div style={{ display: "flex", gap: 6, padding: "10px 12px", overflowX: "auto", borderBottom: `1px solid ${C.line}` }}>
          {[["moderation", "Moderation"], ["laender", "Länder"], ["antworten", "Antworten"], ["getraenke", "Getränke"], ["user", "User"], ["stats", "Analytics"]].map(([k, l]) => (
            <button key={k} onClick={() => setAdminTab(k)} style={{ border: "none", cursor: "pointer", borderRadius: 99, padding: "8px 14px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap", background: adminTab === k ? C.gold : C.panel2, color: adminTab === k ? "#3A2200" : C.mut }}>{l}</button>
          ))}
        </div>
        <main style={{ flex: 1, overflowY: "auto", padding: 14, paddingBottom: 30 }}>
          {adminTab === "moderation" && (<>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {["pending", "approved", "rejected", "alle"].map((f) => (
                <button key={f} onClick={() => setModFilter(f)} style={{ border: `1px solid ${modFilter === f ? C.red : C.line}`, background: "transparent", color: modFilter === f ? C.red : C.mut, borderRadius: 99, padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{f}</button>
              ))}
            </div>
            {filtered.length === 0 && <Card><div style={{ color: C.mut, textAlign: "center" }}>Keine Einträge mit diesem Status.</div></Card>}
            {filtered.map((s) => (
              <Card key={s.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: C.cream }}>@{s.user} <span style={{ color: C.mut, fontWeight: 400, fontSize: 12 }}>· {countries.find((c) => c.id === s.land)?.flag} {s.land} · {s.datum}</span></div>
                    {s.via && <div style={{ marginTop: 3 }}><Tag color={C.gold} border="#6B4E1E">🎉 via {s.via}</Tag></div>}
                    <div style={{ ...led, fontSize: 24, marginTop: 4 }}>{fmtTime(s.zeit)}</div>
                    <div style={{ fontSize: 11, color: C.mut, marginTop: 2 }}>Eingetragene Zeit – mit Display im Video abgleichen</div>
                  </div>
                  <StatusTag s={s.status} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <Btn kind="soft" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setVideoEntry(s)}><Video size={14} /> Video ansehen</Btn>
                  {s.status === "pending" && (<>
                    <Btn kind="gold" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => moderate(s.id, "approved")}><Check size={14} /> Freigeben</Btn>
                    <Btn kind="danger" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => moderate(s.id, "rejected")}><X size={14} /> Ablehnen</Btn>
                  </>)}
                  {s.status === "approved" && (
                    <Btn kind={s.videoPublic ? "primary" : "ghost"} style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => set({ subs: subs.map((x) => x.id === s.id ? { ...x, videoPublic: !x.videoPublic } : x) })}>
                      {s.videoPublic ? <Eye size={14} /> : <EyeOff size={14} />} Video öffentlich: {s.videoPublic ? "JA" : "NEIN"}
                    </Btn>
                  )}
                </div>
              </Card>
            ))}
            <Btn kind="ghost" style={{ width: "100%", marginTop: 6 }} onClick={exportCSV}><Download size={16} /> Ranking als CSV exportieren</Btn>
          </>)}

          {adminTab === "laender" && (<>
            <SectionTitle>Länder & Rankings verwalten</SectionTitle>
            {countries.map((c) => (
              <Card key={c.id} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: C.cream, fontWeight: 700 }}>{c.flag} {c.name} <span style={{ color: C.mut, fontSize: 12, fontWeight: 400 }}>({subs.filter((s) => s.land === c.id && s.status === "approved").length} Einträge)</span></div>
                <Btn kind={c.active ? "ghost" : "danger"} style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => set({ countries: countries.map((x) => x.id === c.id ? { ...x, active: !x.active } : x) })}>{c.active ? "Aktiv" : "Deaktiviert"}</Btn>
              </Card>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Neues Land, z. B. Schweiz" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
              <Btn onClick={() => { if (!newCountry.trim()) return; set({ countries: [...countries, { id: newCountry.slice(0, 2).toUpperCase(), name: newCountry.trim(), flag: "🌍", active: true }] }); setNewCountry(""); showToast("Land angelegt – Ranking sofort verfügbar"); }}><Plus size={16} /></Btn>
            </div>
          </>)}

          {adminTab === "antworten" && (<>
            <SectionTitle>Vordefinierte Check-in-Reaktionen</SectionTitle>
            {reactions.map((r, i) => (
              <Card key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ color: C.cream, fontSize: 14 }}>{r}</div>
                <button onClick={() => set({ reactions: reactions.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", color: C.mut }}><Trash2 size={16} /></button>
              </Card>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Neue Antwort…" value={newReaction} onChange={(e) => setNewReaction(e.target.value)} />
              <Btn onClick={() => { if (!newReaction.trim()) return; set({ reactions: [...reactions, newReaction.trim()] }); setNewReaction(""); }}><Plus size={16} /></Btn>
            </div>
          </>)}

          {adminTab === "getraenke" && (<>
            <SectionTitle>Einzelgetränke für Check-in</SectionTitle>
            {drinks.map((d, i) => (
              <Card key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <DrinkImg src={d.img} size={40} />
                  <div style={{ color: C.cream, fontSize: 14, fontWeight: 600 }}>{d.name}</div>
                </div>
                <button onClick={() => set({ drinks: drinks.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", color: C.mut }}><Trash2 size={16} /></button>
              </Card>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder="Neues Getränk (z. B. Shot Marille)…" value={newDrink} onChange={(e) => setNewDrink(e.target.value)} />
              <Btn onClick={() => { if (!newDrink.trim()) return; set({ drinks: [...drinks, { name: newDrink.trim(), img: null }] }); setNewDrink(""); }}><Plus size={16} /></Btn>
            </div>
            <div style={{ fontSize: 12, color: C.mut, marginTop: 8 }}>Produktbild kann später verknüpft werden (Shopify-CDN-URL).</div>
          </>)}

          {adminTab === "user" && (<>
            <SectionTitle>User-Management</SectionTitle>
            {users.map((u) => (
              <Card key={u.user} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ color: C.cream, fontWeight: 700 }}>@{u.user} {u.locked && <Tag color={C.red} border={C.redDark}>GESPERRT</Tag>}</div>
                    <div style={{ fontSize: 12, color: C.mut }}>{u.name} · {u.land} · Bestzeit: <span style={{ color: C.gold }}>{fmtTime(bestOf(u.user))}</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn kind="ghost" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => set({ users: users.map((x) => x.user === u.user ? { ...x, locked: !x.locked } : x) })}><Ban size={13} /> {u.locked ? "Entsperren" : "Sperren"}</Btn>
                    <Btn kind="danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => set({ users: users.filter((x) => x.user !== u.user) })}><Trash2 size={13} /></Btn>
                  </div>
                </div>
              </Card>
            ))}
          </>)}

          {adminTab === "stats" && (<>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Card><div style={{ fontSize: 11, color: C.mut, fontWeight: 700 }}>UPLOADS GESAMT</div><div style={{ ...led, fontSize: 30 }}>{subs.length}</div></Card>
              <Card><div style={{ fontSize: 11, color: C.mut, fontWeight: 700 }}>PENDING</div><div style={{ ...led, fontSize: 30 }}>{subs.filter((s) => s.status === "pending").length}</div></Card>
              <Card><div style={{ fontSize: 11, color: C.mut, fontWeight: 700 }}>Ø ZEIT</div><div style={{ ...led, fontSize: 30 }}>{avg ? avg.toFixed(2).replace(".", ",") : "–"} s</div></Card>
              <Card><div style={{ fontSize: 11, color: C.mut, fontWeight: 700 }}>CHECK-INS</div><div style={{ ...led, fontSize: 30 }}>{checkins.length}</div></Card>
            </div>
            <SectionTitle>Aktivste Länder</SectionTitle>
            <Card>
              {byLand.map((b) => (
                <div key={b.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.cream, marginBottom: 4 }}>
                    <span>{b.flag} {b.name}</span><span style={{ color: C.mut }}>{b.n}</span>
                  </div>
                  <div style={{ height: 8, background: C.panel2, borderRadius: 6 }}>
                    <div style={{ width: `${(b.n / maxN) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.red}, ${C.gold})`, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </Card>
          </>)}
        </main>
        {videoEntry && <VideoOverlay entry={videoEntry} onClose={() => setVideoEntry(null)} />}
        {toast && <Toast msg={toast} />}
      </Shell>
    );
  }

  /* ============ USER-APP ============ */
  const myRuns = subs.filter((s) => s.user === me);
  const myBest = bestOf(me);

  return (
    <Shell>
      <header style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "5px 9px" }}>
          <img src={LOGO} alt="Gschpusi" style={{ height: 26, display: "block" }} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Bell size={19} color={C.mut} />
          <button onClick={() => setAdminMode(true)} title="Admin" style={{ background: "none", border: "none", cursor: "pointer" }}><Shield size={19} color={C.gold} /></button>
        </div>
      </header>

      {!shared && (
        <div style={{ background: C.panel2, padding: "8px 14px", fontSize: 11, color: C.gold, borderBottom: `1px solid ${C.line}` }}>
          ⚠️ Speicherung nicht verfügbar – Änderungen gehen beim Neuladen verloren.
        </div>
      )}

      <main style={{ flex: 1, overflowY: "auto", padding: 14, paddingBottom: 90 }}>

        {/* ---- RACE ---- */}
        {tab === "race" && (<>
          <div style={{ textAlign: "center", padding: "22px 10px 16px", background: "radial-gradient(ellipse at top, rgba(232,40,60,0.16), transparent 70%)", borderRadius: 18 }}>
            <img src={LOGO_RACER} alt="Shotrace" style={{ width: 150, marginBottom: 8 }} />
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C.mut, fontWeight: 700 }}>EUROPAREKORD</div>
            <div style={{ ...led, fontSize: 52, lineHeight: 1.1 }}>{fmtTime(bestTime)}</div>
            <div style={{ color: C.pink, fontSize: 13, marginTop: 4 }}>Schaffst du das? Pack raus, Kamera an. 🎬</div>
            <Btn onClick={() => setSubmitStep(1)} style={{ marginTop: 16, width: "80%" }}><Upload size={17} /> Lauf einreichen</Btn>
          </div>
          <Card style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: C.mut, fontWeight: 700, letterSpacing: "0.1em" }}>DEINE BESTZEIT</div>
              <div style={{ ...led, fontSize: 28 }}>{fmtTime(myBest)}</div>
            </div>
            <Tag color={C.pink} border={C.redDark}><Zap size={10} style={{ verticalAlign: -1 }} /> Für Freunde sichtbar</Tag>
          </Card>
          <SectionTitle>Meine Läufe</SectionTitle>
          {myRuns.length === 0 && <Card><div style={{ color: C.mut, textAlign: "center", fontSize: 14 }}>Noch kein Lauf – Zeit, das zu ändern! 🏁</div></Card>}
          {[...myRuns].reverse().map((r) => (
            <Card key={r.id} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ ...led, fontSize: 22 }}>{fmtTime(r.zeit)}</div>
                <div style={{ fontSize: 12, color: C.mut }}>{r.datum}</div>
              </div>
              <StatusTag s={r.status} />
            </Card>
          ))}
        </>)}

        {/* ---- RANKING ---- */}
        {tab === "ranking" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 14, background: C.panel, borderRadius: 99, padding: 4 }}>
            {[["official", "🏆 Offiziell"], ["events", "🎉 Events"]].map(([k, l]) => (
              <button key={k} onClick={() => { setRankView(k); setActiveEvent(null); }} style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 99, padding: "9px 0", fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: rankView === k ? C.red : "transparent", color: rankView === k ? "#fff" : C.mut }}>{l}</button>
            ))}
          </div>
        )}
        {tab === "ranking" && rankView === "official" && (<>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
            {[{ id: "EU", name: "Europa", flag: "🇪🇺" }, ...countries.filter((c) => c.active)].map((c) => (
              <button key={c.id} onClick={() => setRankLand(c.id)} style={{ border: "none", cursor: "pointer", borderRadius: 99, padding: "8px 14px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap", background: rankLand === c.id ? C.red : C.panel2, color: rankLand === c.id ? "#fff" : C.mut }}>{c.flag} {c.name}</button>
            ))}
          </div>
          {ranking.length === 0 && <Card><div style={{ color: C.mut, textAlign: "center" }}>Noch keine freigegebenen Zeiten.</div></Card>}
          {ranking.map((s, i) => (
            <Card key={s.id} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12, borderColor: i === 0 ? C.gold : C.line }}>
              <div style={{ minWidth: 34, textAlign: "center", fontSize: i < 3 ? 22 : 15, fontWeight: 800, color: i === 0 ? C.gold : C.cream }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: s.user === me ? C.pink : C.cream, fontSize: 14 }}>@{s.user} <span style={{ fontSize: 12 }}>{countries.find((c) => c.id === s.land)?.flag}</span></div>
                <div style={{ ...led, fontSize: 19 }}>{fmtTime(s.zeit)}</div>
              </div>
              {s.videoPublic && <Btn kind="soft" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setVideoEntry(s)}><Play size={13} /> Video</Btn>}
            </Card>
          ))}
        </>)}

        {/* ---- EVENT-CHALLENGES: Liste ---- */}
        {tab === "ranking" && rankView === "events" && !activeEvent && (<>
          {events.map((ev) => {
            const n = eventSubs.filter((s) => s.eventId === ev.id && s.status === "confirmed").length;
            const pend = eventSubs.filter((s) => s.eventId === ev.id && s.status === "pending").length;
            return (
              <Card key={ev.id} onClick={() => setActiveEvent(ev.id)} style={{ marginBottom: 10, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: C.cream, fontSize: 15 }}>🎉 {ev.name}</div>
                    <div style={{ fontSize: 12, color: C.mut, marginTop: 3 }}>
                      Event-Admin: <span style={{ color: C.pink, fontWeight: 700 }}>@{ev.admin}</span> · {n} Zeiten
                      {ev.admin === me && pend > 0 && <span style={{ color: C.gold }}> · {pend} zu prüfen!</span>}
                    </div>
                  </div>
                  <Trophy size={20} color={C.gold} />
                </div>
              </Card>
            );
          })}
          <SectionTitle>Eigene Challenge starten</SectionTitle>
          <Card>
            <div style={{ fontSize: 13, color: C.mut, marginBottom: 10 }}>Erstell ein internes Ranking für dein Fest, deine Bar oder dein Festival. Du wirst automatisch Event-Admin und bestätigst die Zeiten deiner Gäste.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder='z. B. "Beachparty XXL – Wels"' value={newEventName} onChange={(e) => setNewEventName(e.target.value)} />
              <Btn onClick={createEvent}><Plus size={16} /></Btn>
            </div>
          </Card>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 10, textAlign: "center" }}>ℹ️ Event-Zeiten zählen nur intern. Ins offizielle Ranking kommen Läufe nur mit Videobeweis nach Prüfung durchs Gschpusi-Team.</div>
        </>)}

        {/* ---- EVENT-CHALLENGES: Detail ---- */}
        {tab === "ranking" && rankView === "events" && activeEvent && (() => {
          const ev = events.find((e) => e.id === activeEvent);
          if (!ev) return null;
          const confirmed = eventSubs.filter((s) => s.eventId === ev.id && s.status === "confirmed").sort((a, b) => a.zeit - b.zeit);
          const pending = eventSubs.filter((s) => s.eventId === ev.id && s.status === "pending");
          const myPending = pending.filter((s) => s.user === me);
          const isAdmin = ev.admin === me;
          return (<>
            <button onClick={() => setActiveEvent(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.mut, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit", fontSize: 13, fontWeight: 700, marginBottom: 10, padding: 0 }}><ChevronLeft size={16} /> Alle Events</button>
            <div style={{ textAlign: "center", padding: "16px 10px", background: "radial-gradient(ellipse at top, rgba(255,179,71,0.14), transparent 70%)", borderRadius: 18, marginBottom: 12 }}>
              <div style={{ fontWeight: 900, color: C.cream, fontSize: 19 }}>🎉 {ev.name}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 4 }}>Internes Event-Ranking · Event-Admin: <span style={{ color: C.pink, fontWeight: 700 }}>@{ev.admin}</span></div>
              {!evSubmitOpen && <Btn kind="gold" style={{ marginTop: 12 }} onClick={() => setEvSubmitOpen(true)}><Timer size={15} /> Meine Zeit eintragen</Btn>}
            </div>
            {evSubmitOpen && (
              <Card style={{ marginBottom: 12 }}>
                <input style={{ ...inputStyle, ...led, fontSize: 24, textAlign: "center", marginBottom: 10 }} placeholder="0,00" inputMode="decimal" value={evTime} onChange={(e) => setEvTime(e.target.value)} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.cream }}>🎬 Mit Videobeweis <span style={{ color: C.mut, fontSize: 11 }}>(zählt fürs offizielle Ranking)</span></div>
                  <Toggle on={evVideo} onClick={() => setEvVideo(!evVideo)} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn style={{ flex: 1 }} onClick={submitEventRun}><Upload size={15} /> Eintragen</Btn>
                  <Btn kind="ghost" onClick={() => setEvSubmitOpen(false)}><X size={15} /></Btn>
                </div>
              </Card>
            )}
            {isAdmin && pending.length > 0 && (<>
              <SectionTitle>Zu bestätigen ({pending.length})</SectionTitle>
              {pending.map((s) => (
                <Card key={s.id} style={{ marginBottom: 8, borderColor: C.gold }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.cream, fontSize: 14 }}>@{s.user} {s.video && <Tag color={C.pink} border={C.redDark}>🎬 VIDEO</Tag>}</div>
                      <div style={{ ...led, fontSize: 20 }}>{fmtTime(s.zeit)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn kind="gold" style={{ padding: "8px 11px", fontSize: 12 }} onClick={() => moderateEventRun(s.id, true)}><Check size={14} /></Btn>
                      <Btn kind="danger" style={{ padding: "8px 11px", fontSize: 12 }} onClick={() => moderateEventRun(s.id, false)}><X size={14} /></Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </>)}
            <SectionTitle>Event-Ranking</SectionTitle>
            {confirmed.length === 0 && <Card><div style={{ color: C.mut, textAlign: "center" }}>Noch keine bestätigten Zeiten – sei die/der Erste! 🏁</div></Card>}
            {confirmed.map((s, i) => (
              <Card key={s.id} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12, borderColor: i === 0 ? C.gold : C.line }}>
                <div style={{ minWidth: 34, textAlign: "center", fontSize: i < 3 ? 22 : 15, fontWeight: 800, color: i === 0 ? C.gold : C.cream }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: s.user === me ? C.pink : C.cream, fontSize: 14 }}>@{s.user} {s.video && <span style={{ fontSize: 11 }}>🎬</span>}</div>
                  <div style={{ ...led, fontSize: 19 }}>{fmtTime(s.zeit)}</div>
                </div>
              </Card>
            ))}
            {myPending.length > 0 && <div style={{ fontSize: 12, color: C.gold, textAlign: "center", marginTop: 10 }}>⏳ {myPending.length} Zeit(en) von dir warten auf Bestätigung durch @{ev.admin}</div>}
            {isAdmin && (
              <Card style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.mut, marginBottom: 8 }}>EVENT-ADMIN ÜBERTRAGEN</div>
                <select defaultValue="" onChange={(e) => { if (!e.target.value) return; set({ events: events.map((x) => x.id === ev.id ? { ...x, admin: e.target.value } : x) }); showToast(`@${e.target.value} ist jetzt Event-Admin`); }} style={{ ...inputStyle, appearance: "none" }}>
                  <option value="" disabled>Registrierten User wählen…</option>
                  {users.filter((u) => u.user !== me && !u.locked).map((u) => <option key={u.user} value={u.user}>@{u.user}</option>)}
                </select>
              </Card>
            )}
          </>);
        })()}

        {/* ---- CHECK-IN ---- */}
        {tab === "checkin" && (<>
          <Btn onClick={() => setCheckinOpen(true)} style={{ width: "100%" }}><GlassWater size={17} /> Was trinkst du gerade?</Btn>
          <SectionTitle>Deine Freunde – live 🍻</SectionTitle>
          {checkins.map((c) => (
            <Card key={c.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <DrinkImg src={drinkImg(c.drink)} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.cream, fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    @{c.user}
                    <span style={{ ...led, fontSize: 12 }}>{fmtTime(bestOf(c.user))}</span>
                    <span style={{ color: C.mut, fontWeight: 400, fontSize: 12 }}>· {c.zeit}</span>
                  </div>
                  <div style={{ color: C.pink, fontSize: 14 }}>trinkt <b>{c.drink}</b></div>
                  <div style={{ color: C.mut, fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><MapPin size={12} /> {c.ort}</div>
                </div>
              </div>
              {c.reactions.length > 0 && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
                  {c.reactions.map((r, i) => (
                    <div key={i} style={{ fontSize: 13, color: C.cream, marginBottom: 4 }}><span style={{ color: C.mut }}>@{r.user}:</span> {r.text}</div>
                  ))}
                </div>
              )}
              {c.user !== me && (
                <div style={{ marginTop: 10 }}>
                  {reactTarget === c.id ? (<>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {reactions.map((r, i) => (
                        <button key={i} onClick={() => sendReaction(c.id, r)} style={{ border: `1px solid ${C.line}`, background: C.panel2, color: C.cream, borderRadius: 99, padding: "6px 11px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{r}</button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input style={{ ...inputStyle, flex: 1, padding: "9px 11px" }} placeholder="Eigene Nachricht…" value={freeText} onChange={(e) => setFreeText(e.target.value)} />
                      <Btn style={{ padding: "9px 13px" }} onClick={() => sendReaction(c.id, freeText)}><MessageCircle size={15} /></Btn>
                    </div>
                  </>) : (
                    <Btn kind="ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => setReactTarget(c.id)}><Heart size={13} /> Reagieren</Btn>
                  )}
                </div>
              )}
            </Card>
          ))}
        </>)}

        {/* ---- FREUNDE ---- */}
        {tab === "friends" && (<>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search size={16} color={C.mut} style={{ position: "absolute", left: 12, top: 13 }} />
            <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="User suchen & Anfrage senden…" />
          </div>
          {requests.length > 0 && (<>
            <SectionTitle>Anfragen ({requests.length})</SectionTitle>
            {requests.map((r) => (
              <Card key={r} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ color: C.cream, fontWeight: 700 }}>@{r}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn style={{ padding: "7px 11px", fontSize: 12 }} onClick={() => { set({ friends: [...friends, r], requests: requests.filter((x) => x !== r) }); showToast(`@${r} ist jetzt dein Freund 🎉`); }}><Check size={13} /></Btn>
                  <Btn kind="ghost" style={{ padding: "7px 11px", fontSize: 12 }} onClick={() => set({ requests: requests.filter((x) => x !== r) })}><X size={13} /></Btn>
                </div>
              </Card>
            ))}
          </>)}
          <SectionTitle>Meine Freunde ({friends.length})</SectionTitle>
          {friends.map((f) => (
            <Card key={f} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={f} size={38} />
                <div>
                  <div style={{ color: C.cream, fontWeight: 700 }}>@{f}</div>
                  <div style={{ ...led, fontSize: 13 }}>🏁 {fmtTime(bestOf(f))}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn kind="ghost" style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => { set({ friends: friends.filter((x) => x !== f) }); showToast(`@${f} entfernt`); }}>Entfernen</Btn>
                <Btn kind="danger" style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => { set({ friends: friends.filter((x) => x !== f) }); showToast(`@${f} blockiert`); }}><Ban size={12} /></Btn>
              </div>
            </Card>
          ))}
        </>)}

        {/* ---- MEHR ---- */}
        {tab === "more" && (<>
          <Card style={{ textAlign: "center", padding: 22 }}>
            <Avatar name={me} size={66} />
            <div style={{ fontWeight: 900, color: C.cream, fontSize: 18, marginTop: 10 }}>@{me}</div>
            <div style={{ color: C.mut, fontSize: 13 }}>🇦🇹 Oberösterreich · dabei seit Juli 2026</div>
            <div style={{ ...led, fontSize: 26, marginTop: 10 }}>{fmtTime(myBest)}</div>
            <div style={{ fontSize: 11, color: C.mut, letterSpacing: "0.12em" }}>DEINE BESTZEIT · FÜR FREUNDE IMMER SICHTBAR</div>
          </Card>
          <SectionTitle>Gschpusi</SectionTitle>
          <a href="https://gschpusi.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: C.cream, fontWeight: 700 }}><Globe size={17} color={C.pink} /> gschpusi.com</div>
              <ExternalLink size={15} color={C.mut} />
            </Card>
          </a>
          <a href="https://shop.gschpusi.com" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: C.cream, fontWeight: 700 }}><ShoppingBag size={17} color={C.pink} /> Online-Shop</div>
              <ExternalLink size={15} color={C.mut} />
            </Card>
          </a>
          <SectionTitle>Einstellungen</SectionTitle>
          <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: C.cream, fontSize: 14 }}>📍 Standort bei Check-ins teilen</div>
            <Toggle on={shareLoc} onClick={() => setShareLoc(!shareLoc)} />
          </Card>
          <Card style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: C.cream, fontSize: 14 }}>🔔 Push-Benachrichtigungen</div>
            <Toggle on={true} onClick={() => showToast("Demo: Push-Einstellungen")} />
          </Card>
          <Btn kind="ghost" style={{ width: "100%", marginTop: 10 }} onClick={() => setLoggedIn(false)}><LogOut size={15} /> Abmelden</Btn>
          <div style={{ textAlign: "center", fontSize: 11, color: C.mut, marginTop: 18 }}>
            🔞 Enjoy responsibly · Party-Shot GmbH, Thalheim bei Wels<br />Datenschutz · Impressum · AGB
          </div>
        </>)}
      </main>

      {/* Bottom Nav */}
      <nav style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.panel, borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 4px calc(10px + env(safe-area-inset-bottom))" }}>
        {[["race", Timer, "Race"], ["ranking", Trophy, "Ranking"], ["checkin", GlassWater, "Check-in"], ["friends", Users, "Freunde"], ["more", Menu, "Mehr"]].map(([k, Icon, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === k ? C.red : C.mut, fontFamily: "inherit" }}>
            <Icon size={21} /><span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Einreichen-Flow */}
      {submitStep > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,4,6,0.9)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: C.panel, borderRadius: "22px 22px 0 0", padding: 20, borderTop: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, color: C.cream, fontSize: 16 }}>Lauf einreichen · Schritt {submitStep}/3</div>
              <button onClick={() => setSubmitStep(0)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.mut} /></button>
            </div>
            {submitStep === 1 && (
              <div onClick={() => setSubmitStep(2)} style={{ border: `2px dashed ${C.line}`, borderRadius: 16, padding: "34px 16px", textAlign: "center", cursor: "pointer" }}>
                <Video size={30} color={C.pink} style={{ marginBottom: 8 }} />
                <div style={{ color: C.cream, fontWeight: 700 }}>Video auswählen</div>
                <div style={{ color: C.mut, fontSize: 12, marginTop: 4 }}>MP4/MOV · max. 60 s · max. 100 MB · (Upload folgt mit Backend)</div>
              </div>
            )}
            {submitStep === 2 && (<>
              <div style={{ background: C.panel2, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <Video size={18} color={C.pink} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.cream, fontSize: 13, fontWeight: 700 }}>shotrace_lauf.mp4</div>
                  <div style={{ height: 5, background: C.line, borderRadius: 4, marginTop: 6 }}><div style={{ width: "100%", height: "100%", background: C.gold, borderRadius: 4 }} /></div>
                </div>
                <Check size={16} color="#7BE0A3" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.mut, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Deine Zeit (wie am Display)</div>
              <input style={{ ...inputStyle, ...led, fontSize: 26, textAlign: "center", marginBottom: 14 }} placeholder="0,00" inputMode="decimal" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              <Btn style={{ width: "100%" }} onClick={() => setSubmitStep(3)} disabled={!newTime}>Weiter</Btn>
            </>)}
            {submitStep === 3 && (<>
              <Card style={{ marginBottom: 14, textAlign: "center" }}>
                <div style={{ ...led, fontSize: 34 }}>{newTime ? fmtTime(parseFloat(newTime.replace(",", ".")) || 0) : "–"}</div>
                <div style={{ color: C.mut, fontSize: 12, marginTop: 4 }}>Das Gschpusi-Team gleicht deine Zeit mit dem Display im Video ab.</div>
              </Card>
              <Btn style={{ width: "100%" }} onClick={submitRun}><Upload size={16} /> Verbindlich einreichen</Btn>
            </>)}
          </div>
        </div>
      )}

      {/* Check-in-Sheet */}
      {checkinOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,4,6,0.9)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", maxHeight: "85%", overflowY: "auto", background: C.panel, borderRadius: "22px 22px 0 0", padding: 20, borderTop: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 900, color: C.cream, fontSize: 16 }}>Drink Check-in 🍻</div>
              <button onClick={() => setCheckinOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.mut} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {drinks.map((d) => (
                <button key={d.name} onClick={() => setSelDrink(d.name)} style={{ border: `1px solid ${selDrink === d.name ? C.red : C.line}`, background: selDrink === d.name ? "rgba(232,40,60,0.16)" : C.panel2, borderRadius: 14, padding: "10px 6px", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <DrinkImg src={d.img} size={52} />
                  <div style={{ color: selDrink === d.name ? C.pink : C.cream, fontSize: 11, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{d.name}</div>
                </button>
              ))}
              <button onClick={() => setSelDrink("__custom")} style={{ border: `1px dashed ${selDrink === "__custom" ? C.red : C.line}`, background: "transparent", borderRadius: 14, padding: "10px 6px", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: C.mut, fontSize: 11, fontWeight: 700 }}>
                <Plus size={22} /> Eigenes Getränk
              </button>
            </div>
            {selDrink === "__custom" && (
              <input style={{ ...inputStyle, marginBottom: 12 }} placeholder="Was trinkst du?" value={customDrink} onChange={(e) => setCustomDrink(e.target.value)} />
            )}
            <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: C.cream, display: "flex", gap: 8, alignItems: "center" }}><MapPin size={15} color={C.pink} /> Standort teilen (nur Freunde)</div>
              <Toggle on={shareLoc} onClick={() => setShareLoc(!shareLoc)} />
            </Card>
            <Btn style={{ width: "100%" }} onClick={doCheckin}><GlassWater size={16} /> Einchecken</Btn>
            <div style={{ fontSize: 11, color: C.mut, textAlign: "center", marginTop: 10 }}>Sichtbar nur für bestätigte Freunde · bleibt bis zum nächsten Check-in</div>
          </div>
        </div>
      )}

      {videoEntry && <VideoOverlay entry={videoEntry} onClose={() => setVideoEntry(null)} />}
      {toast && <Toast msg={toast} />}
    </Shell>
  );
}
