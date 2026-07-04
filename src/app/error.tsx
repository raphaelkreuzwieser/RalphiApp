"use client";

import { PhoneFrame } from "@/components/PhoneFrame";
import { Btn } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="text-5xl">🍹</div>
        <h1 className="text-xl font-black text-creme">Ups – da ist was daneben gegangen.</h1>
        <p className="text-sm text-muted">
          Keine Sorge, das liegt nicht an dir. Probier&apos;s einfach nochmal.
        </p>
        <Btn onClick={reset}>Nochmal versuchen</Btn>
      </div>
    </PhoneFrame>
  );
}
