import BannerCarousel from "@/components/custom-ui/content/public/BannerCarousel";
import SpeakerMarquee from "@/components/custom-ui/content/public/SpeakerMarquee";
import PublicPageClient from "@/components/custom-ui/content/public/PublicPageClient";

export default function PublicPage() {
  return (
    <div className="space-y-8 pb-10">
      <BannerCarousel />
      <SpeakerMarquee />
      <PublicPageClient />
    </div>
  );
}
