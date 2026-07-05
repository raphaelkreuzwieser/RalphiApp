import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shotrace.gschpusi.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Gschpusi Shotrace – Wie schnell bist du?",
    template: "%s · Gschpusi Shotrace",
  },
  description:
    "Shotrace – das Shot-Wetttrinken mit elektronischer Zeitmessung. Lauf hochladen, Zeit eintragen, ins Ranking. 🏁 Home of Partydrinks.",
  applicationName: "Gschpusi Shotrace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shotrace",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Gschpusi Shotrace",
    title: "Gschpusi Shotrace – Wie schnell bist du? 🏁",
    description:
      "Shot-Wetttrinken mit elektronischer Zeitmessung. Beweis, wie schnell du bist.",
    url: APP_URL,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E8283C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
