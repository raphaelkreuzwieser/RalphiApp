import { AutoRefresh } from "@/components/AutoRefresh";
import { getActiveCountries } from "@/lib/countries";
import { getRanking, getMyUsername } from "@/lib/data";
import { getEventsOverview } from "@/lib/events";
import { RankingScreen } from "./RankingScreen";

export const metadata = { title: "Ranking" };
export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const [rows, countries, myUsername, events] = await Promise.all([
    getRanking(),
    getActiveCountries(),
    getMyUsername(),
    getEventsOverview(),
  ]);

  return (
    <>
      <AutoRefresh />
      <RankingScreen rows={rows} countries={countries} myUsername={myUsername} events={events} />
    </>
  );
}
