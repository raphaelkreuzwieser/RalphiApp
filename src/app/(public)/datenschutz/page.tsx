import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p>
        Verantwortlich: Party-Shot GmbH, Thalheim bei Wels. Der Schutz deiner Daten ist
        uns wichtig. Diese App ist auf Servern in der EU (Frankfurt) gehostet.
      </p>
      <p>
        <strong className="text-creme">Öffentlich sichtbar</strong> ist immer nur dein
        Username, dein Land und deine Zeiten – niemals dein echter Name, dein Geburtsdatum
        oder deine Telefonnummer.
      </p>
      <p>
        <strong className="text-creme">Standortdaten</strong> werden ausschließlich bei
        aktivem Check-in mit deiner Einwilligung erhoben und sind nur für bestätigte
        Freunde sichtbar. Du kannst das jederzeit in den Einstellungen deaktivieren.
      </p>
      <p>Der finale Datenschutztext inkl. Betroffenenrechte folgt vor dem Launch.</p>
    </LegalPage>
  );
}
