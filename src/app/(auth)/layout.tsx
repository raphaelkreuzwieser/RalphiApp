import { PhoneFrame } from "@/components/PhoneFrame";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10">
        {children}
      </div>
    </PhoneFrame>
  );
}
