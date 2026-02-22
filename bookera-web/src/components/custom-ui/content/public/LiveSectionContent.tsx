"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LiveSectionContent() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const contents = [
    {
      id: 1,
      title: "Berita Terkini",
      description: "Launching produk baru minggu depan!",
      icon: "📢",
      bg: "bg-blue-500",
      time: "2 jam lalu",
    },
    {
      id: 2,
      title: "Promo Spesial",
      description: "Diskon 20% untuk semua item",
      icon: "🏷️",
      bg: "bg-green-500",
      time: "Hari ini",
    },
    {
      id: 3,
      title: "Event Mendatang",
      description: "Webinar gratis, daftar sekarang!",
      icon: "🎉",
      bg: "bg-purple-500",
      time: "Besok",
    },
    {
      id: 4,
      title: "Tips & Trik",
      description: "Cara memaksimalkan penggunaan",
      icon: "💡",
      bg: "bg-yellow-500",
      time: "3 jam lalu",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [contents.length]);

  return (
    <div className="h-full rounded-2xl bg-linear-to-br from-gray-800 to-gray-900 p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Update Terkini</h3>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${contents[currentIndex].bg} bg-opacity-20`}
          >
            <span className="text-2xl">{contents[currentIndex].icon}</span>
          </div>
          <div>
            <h4 className="font-medium text-white">
              {contents[currentIndex].title}
            </h4>
            <p className="text-xs text-gray-400">
              {contents[currentIndex].time}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-300">
          {contents[currentIndex].description}
        </p>

        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-700">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </motion.div>

      <div className="mt-4 flex justify-center gap-1">
        {contents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-4 bg-blue-500"
                : "w-1.5 bg-gray-600 hover:bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
