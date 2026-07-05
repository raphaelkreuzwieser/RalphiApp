import { AutoRefresh } from "@/components/AutoRefresh";
import { getFriendsData } from "@/lib/social";
import { FreundeScreen } from "./FreundeScreen";

export const metadata = { title: "Freunde" };
export const dynamic = "force-dynamic";

export default async function FreundePage() {
  const { incoming, friends } = await getFriendsData();
  return (
    <>
      <AutoRefresh />
      <FreundeScreen incoming={incoming} friends={friends} />
    </>
  );
}
