import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { ReviewView } from "@/components/review-view";

export default async function ReviewPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return <ReviewView />;
}
