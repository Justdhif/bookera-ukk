import ExploreClient from "@/components/custom-ui/content/public/ExploreClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | Explore",
  description: "Discover books, discussions, and community members on Bookera.",
};

export default function ExplorePage() {
  return <ExploreClient />;
}
