import PublicNewsGrid from "@/components/custom-ui/content/public/news/PublicNewsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookera | News",
  description: "Stay updated with the latest library news and announcements.",
};

export default function NewsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">Library News</h1>
        <p className="text-muted-foreground font-medium mt-2">
          Updates, announcements, and interesting articles.
        </p>
      </div>
      <PublicNewsGrid />
    </div>
  );
}
