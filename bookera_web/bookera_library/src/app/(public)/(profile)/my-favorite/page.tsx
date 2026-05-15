import MyFavoritesClient from "@/components/custom-ui/content/public/profile/me/MyFavoritesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | My Favorites",
  description: "View your bookmarked and favorite books.",
};

export default function MyFavoritePage() {
  return <MyFavoritesClient />;
}
