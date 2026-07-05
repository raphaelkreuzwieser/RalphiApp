import type { ReactNode } from "react";

/**
 * Mobile-first Rahmen: max-width 430 px, zentriert auf Desktop,
 * dunkler Außenrand wie im Prototyp (Shell).
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] justify-center bg-[#0C0508]">
      <div className="relative flex min-h-[100dvh] w-full max-w-app flex-col overflow-hidden bg-bg">
        {children}
      </div>
    </div>
  );
}
