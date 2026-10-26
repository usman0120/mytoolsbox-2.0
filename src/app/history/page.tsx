import { redirect } from "next/navigation";

export default function HistoryPage() {
  redirect("/settings?tab=history");
}
