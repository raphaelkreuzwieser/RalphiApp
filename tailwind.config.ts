import type { Config } from "tailwindcss";

/**
 * Design-System aus dem Übergabeprotokoll (Abschnitt 5), 1:1 übernommen.
 * Nachtclub-Dunkel mit Rotstich, Gschpusi-Rot als Primärfarbe,
 * Gold für alle Zeitmessungen (LED-Look).
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#160A0E", // Nachtclub-Dunkel mit Rotstich
        panel: "#241218",
        panel2: "#2E171F", // Panel 2 / Input
        line: "#42222C", // Linien / Border
        rot: {
          DEFAULT: "#E8283C", // Gschpusi-Rot (Primär, aktiv)
          dark: "#B01528",
        },
        bussi: "#FF8FA3", // Bussi-Rosa (Akzente, Social)
        gold: "#FFB347", // Zeitmessung, Admin, Auszeichnungen
        creme: "#FFF3EE", // Text
        muted: "#B98E97", // Sekundärtext
      },
      fontFamily: {
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      maxWidth: {
        app: "430px", // Ziel-Viewport, zentriert auf Desktop
      },
      boxShadow: {
        led: "0 0 12px rgba(255,179,71,0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
