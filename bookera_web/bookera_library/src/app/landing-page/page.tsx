import type { Metadata } from "next";
import LandingPageClient from "@/components/custom-ui/content/landing/LandingPageClient";

export const metadata: Metadata = {
  title: "Bookera | School Digital Library",
  description:
    "Bookera is a modern digital library platform that provides access to thousands of books and learning materials anytime, anywhere.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
