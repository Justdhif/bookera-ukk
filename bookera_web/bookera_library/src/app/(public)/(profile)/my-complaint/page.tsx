import MyComplaintClient from "@/components/custom-ui/content/public/profile/me/MyComplaintClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | My Complaints",
  description: "View and track your submitted complaints.",
};

export default function MyComplaintPage() {
  return <MyComplaintClient />;
}
