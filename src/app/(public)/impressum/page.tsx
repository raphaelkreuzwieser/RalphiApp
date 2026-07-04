import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p>
        <strong className="text-creme">Party-Shot GmbH</strong>
        <br />
        Gschpusi – Home of Partydrinks
        <br />
        Thalheim bei Wels, Österreich
      </p>
      <p>
        Web:{" "}
        <a href="https://gschpusi.com" target="_blank" rel="noreferrer" className="underline">
          gschpusi.com
        </a>
        <br />
        Shop:{" "}
        <a href="https://shop.gschpusi.com" target="_blank" rel="noreferrer" className="underline">
          shop.gschpusi.com
        </a>
      </p>
      <p>Vollständige Angaben (Firmenbuch, UID, Geschäftsführung) folgen vor dem Launch.</p>
    </LegalPage>
  );
}
