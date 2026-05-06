import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MyFavoritesClient from "@/components/custom-ui/content/public/profile/me/MyFavoritesClient";

export default async function AccountFavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) {
    redirect(`/login?redirect=/my-favorite`);
  }

  if (role === "user") {
    redirect("/pricing");
  }

  return <MyFavoritesClient />;
}