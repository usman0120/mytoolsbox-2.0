import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirecting...",
  description: "Resources have moved to Blog.",
};

export default function ResourcesPage() {
  redirect("/blog");
  return null;
}