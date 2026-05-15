import MyProfileClient from "@/components/custom-ui/content/public/profile/me/MyProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | My Profile",
  description: "View and manage your personal profile on Bookera.",
};

export default function MyProfilePage() {
  return <MyProfileClient />;
}
