import BannerCarousel from "@/components/custom-ui/content/public/BannerCarousel";
import SpeakerMarquee from "@/components/custom-ui/content/public/SpeakerMarquee";
import PublicPageClient from "@/components/custom-ui/content/public/PublicPageClient";
import RealTimeClock from "@/components/custom-ui/content/public/RealTimeClock";
import LiveSectionContent from "@/components/custom-ui/content/public/LiveSectionContent";

export default function PublicPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BannerCarousel />
          </div>

          <div className="lg:col-span-1">
            <div className="flex h-full flex-col gap-1">
              <div className="flex-[3]">
                <RealTimeClock />
              </div>
              <div className="flex-[2]">
                <LiveSectionContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SpeakerMarquee />
      <PublicPageClient />
    </div>
  );
}
