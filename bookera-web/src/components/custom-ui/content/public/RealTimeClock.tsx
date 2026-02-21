"use client";

import { useEffect, useState } from "react";

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const hour = time.getHours();

  let theme = {
    bg: "from-orange-400 to-yellow-300",
    icon: "☀️",
    text: "text-yellow-900",
    greeting: "Selamat Pagi",
    timeColor: "text-orange-600",
    cardBg: "bg-white/30",
  };

  if (hour >= 10 && hour < 15) {
    theme = {
      bg: "from-blue-400 to-blue-200",
      icon: "🌞",
      text: "text-blue-900",
      greeting: "Selamat Siang",
      timeColor: "text-blue-600",
      cardBg: "bg-white/30",
    };
  } else if (hour >= 15 && hour < 18) {
    theme = {
      bg: "from-orange-300 to-pink-200",
      icon: "🌅",
      text: "text-orange-900",
      greeting: "Selamat Sore",
      timeColor: "text-orange-600",
      cardBg: "bg-white/30",
    };
  } else if (hour >= 18 || hour < 5) {
    theme = {
      bg: "from-indigo-900 to-purple-900",
      icon: "🌙",
      text: "text-white",
      greeting: "Selamat Malam",
      timeColor: "text-indigo-200",
      cardBg: "bg-white/10",
    };
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayName = days[time.getDay()];
  const date = time.getDate();
  const month = months[time.getMonth()];
  const year = time.getFullYear();

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <div
      className={`h-full rounded-2xl bg-gradient-to-br ${theme.bg} p-4 shadow-xl backdrop-blur-sm transition-all duration-1000`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl">{theme.icon}</span>
            <h2 className={`text-sm font-bold ${theme.text}`}>
              {theme.greeting}
            </h2>
          </div>
          <div
            className={`rounded-full ${theme.cardBg} px-2 py-0.5 backdrop-blur-sm`}
          >
            <span className={`text-xs font-medium ${theme.text}`}>Jakarta</span>
          </div>
        </div>

        <p className={`text-xs opacity-80 ${theme.text}`}>
          {dayName}, {date} {month} {year}
        </p>

        <div className="text-center">
          <div
            className={`text-3xl font-bold tracking-wider ${theme.timeColor}`}
          >
            {hours}:{minutes}
          </div>
          <div className={`text-xs font-light ${theme.text} opacity-80`}>
            {seconds} detik
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <div
            className={`rounded-lg ${theme.cardBg} px-2 py-1 backdrop-blur-sm`}
          >
            <span className={theme.text}>WIB</span>
          </div>
          <div
            className={`rounded-lg ${theme.cardBg} px-2 py-1 backdrop-blur-sm`}
          >
            <span className={theme.text}>28°C</span>
          </div>
          <div
            className={`rounded-lg ${theme.cardBg} px-2 py-1 backdrop-blur-sm`}
          >
            <span className={theme.text}>75%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
