import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { InsightsView } from "@/components/insights-view";

export default async function InsightsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return <InsightsView />;
}
