"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import banner1 from "@/assets/banner/banner-1.png";
import banner2 from "@/assets/banner/banner-2.png";
import banner3 from "@/assets/banner/banner-3.png";
import Image from "next/image";

export default function BannerCarousel() {
  const banners = [
    {
      id: 1,
      image: banner1,
    },
    {
      id: 2,
      image: banner2,
    },
    {
      id: 3,
      image: banner3,
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
            <div
              className="relative w-full"
              style={{ aspectRatio: "160/65" }}
            >
              <Image
                src={banner.image}
                alt={`Banner ${banner.id}`}
                fill
                className="object-cover"
                priority={banner.id === 1}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
