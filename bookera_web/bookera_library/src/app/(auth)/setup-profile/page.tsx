import type { Metadata } from "next";
import SetupProfileClient from "@/components/custom-ui/content/setup-profile/SetupProfileClient";

export const metadata: Metadata = {
  title: "Bookera | Setup Profile",
};

export default function SetupProfilePage() {
  return <SetupProfileClient />;
}
