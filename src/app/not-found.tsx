import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Btn } from "@/components/ui";

export default function NotFound() {
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="led text-6xl">404</div>
        <h1 className="text-xl font-black text-creme">Diese Seite gibt&apos;s nicht.</h1>
        <p className="text-sm text-muted">Vielleicht schon ausgetrunken? 🍸</p>
        <Link href="/race">
          <Btn>Zurück zur App</Btn>
        </Link>
      </div>
    </PhoneFrame>
  );
}
