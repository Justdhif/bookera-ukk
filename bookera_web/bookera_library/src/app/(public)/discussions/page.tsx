import DiscussionPageClient from "@/components/custom-ui/content/public/discussion/DiscussionPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | Community Discussions",
  description: "Join our community discussions and share your thoughts on your favorite books.",
};

export default function DiscussionPage() {
  return <DiscussionPageClient />;
}
