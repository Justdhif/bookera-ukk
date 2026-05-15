import MyBorrowClient from "@/components/custom-ui/content/public/profile/me/MyBorrowClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | My Borrows",
  description: "View and manage your book loans.",
};

export default function MyBorrowPage() {
  return <MyBorrowClient />;
}
