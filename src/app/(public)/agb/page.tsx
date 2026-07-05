import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <LegalPage title="AGB">
      <p>
        Die Nutzung der Gschpusi Shotrace App ist erst ab 18 Jahren erlaubt. Mit der
        Registrierung bestätigst du, dass du volljährig bist.
      </p>
      <p>
        🔞 Alkohol nur in Maßen. Verantwortungsvoller Umgang mit Alkohol liegt uns am
        Herzen – trink nie über deine Grenzen und fahr nie alkoholisiert.
      </p>
      <p>
        Hochgeladene Videos müssen den eigenen Lauf zeigen. Manipulierte Zeiten oder
        fremde Inhalte führen zur Sperre.
      </p>
      <p>Die vollständigen AGB folgen vor dem Launch.</p>
    </LegalPage>
  );
}
