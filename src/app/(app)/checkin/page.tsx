import { Card, SectionTitle } from "@/components/ui";
import { CheckinButton } from "./CheckinButton";

export const metadata = { title: "Check-in" };

export default function CheckinPage() {
  return (
    <>
      <CheckinButton />
      <SectionTitle>Deine Freunde – live 🍻</SectionTitle>
      <Card>
        <div className="text-center text-sm text-muted">
          Noch nichts los – sobald deine Freunde einchecken, siehst du&apos;s hier. 😘
        </div>
      </Card>
    </>
  );
}
