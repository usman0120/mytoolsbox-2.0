import { Metadata } from "next";
import { FavoritesPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Favorites - MyToolsBox",
  description: "Your saved tools and favorites on MyToolsBox.",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}