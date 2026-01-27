"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const banners = [
  {
    id: 1,
    image: "/banner/banner-1.jpg",
    title: "Selamat Datang di Bookera",
    subtitle: "Perpustakaan Digital & Fisik Terintegrasi",
  },
  {
    id: 2,
    image: "/banner/banner-2.jpg",
    title: "Pinjam Buku Lebih Mudah",
    subtitle: "Cari, Pinjam, & Kelola dalam satu platform",
  },
  {
    id: 3,
    image: "/banner/banner-3.jpg",
    title: "Ribuan Koleksi Buku",
    subtitle: "Dari berbagai kategori favoritmu",
  },
];

export default function BannerCarousel() {
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
            <div className="relative h-[260px] md:h-[360px] w-full overflow-hidden">
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
