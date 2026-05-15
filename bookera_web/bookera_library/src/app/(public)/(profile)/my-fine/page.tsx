import MyFinesClient from "@/components/custom-ui/content/public/profile/me/MyFinesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | My Fines",
  description: "View and pay your library fines.",
};

export default function MyFinePage() {
  return <MyFinesClient />;
}
