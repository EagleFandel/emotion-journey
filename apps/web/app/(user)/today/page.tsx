import { redirect } from "next/navigation";
import { TodayView } from "@/components/today-view";
import { getCurrentUserId } from "@/lib/auth";

export default async function TodayPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return <TodayView />;
}
