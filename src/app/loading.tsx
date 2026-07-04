import { Loader2 } from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LOGOS } from "@/lib/assets";

export default function Loading() {
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGOS.shotrace} alt="Gschpusi Shot Race" className="w-[200px] opacity-90" />
        <Loader2 size={26} className="animate-spin text-rot" />
      </div>
    </PhoneFrame>
  );
}
