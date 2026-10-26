import { redirect } from "next/navigation";

export default function FavoritesPage() {
  redirect("/settings?tab=favorites");
}
