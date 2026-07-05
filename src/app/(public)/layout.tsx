import { PhoneFrame } from "@/components/PhoneFrame";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </PhoneFrame>
  );
}
