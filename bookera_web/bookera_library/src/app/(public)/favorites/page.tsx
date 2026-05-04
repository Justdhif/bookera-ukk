import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FavoritesPageClient from "@/components/custom-ui/content/public/favorites/FavoritesPageClient";

export default async function AccountFavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) {
    redirect("/login?redirect=/favorites");
  }

  if (role === "user") {
    redirect("/pricing");
  }

  return <FavoritesPageClient />;
}