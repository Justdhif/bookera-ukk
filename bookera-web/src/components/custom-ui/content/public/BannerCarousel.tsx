"use client";

import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function BannerCarousel() {
  const t = useTranslations('common');
  
  const banners = [
    {
      id: 1,
      image: "/banner/banner-1.jpg",
      title: t('bannerWelcomeTitle'),
      subtitle: t('bannerWelcomeSubtitle'),
    },
    {
      id: 2,
      image: "/banner/banner-2.jpg",
      title: t('bannerBorrowEasyTitle'),
      subtitle: t('searchBorrowManage'),
    },
    {
      id: 3,
      image: "/banner/banner-3.jpg",
      title: t('bannerThousandBooksTitle'),
      subtitle: t('bannerThousandBooksSubtitle'),
    },
  ];

  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="relative h-65 md:h-90 w-full overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center">
                <div className="container mx-auto px-6 text-white space-y-2 animate-fade-in">
                  <h1 className="text-2xl md:text-4xl font-bold">
                    {banner.title}
                  </h1>
                  <p className="text-sm md:text-lg opacity-90">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
