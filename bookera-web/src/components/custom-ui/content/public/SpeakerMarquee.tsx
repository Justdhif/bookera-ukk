"use client";

import { Volume2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Marquee from "react-fast-marquee";

export default function SpeakerMarquee() {
  const t = useTranslations("common");

  const messages = [
    { text: t("discovering"), accent: "#60a5fa" },
    { text: t("rememberReturn"), accent: "#34d399" },
    { text: t("readFavorite"), accent: "#f0854a" },
    { text: t("knowledgeInvestment"), accent: "#c084fc" },
  ];

  return (
    <div className="relative flex items-center h-12.5 overflow-hidden rounded-2xl bg-linear-to-r from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
      <svg
        className="absolute top-0 right-0 w-20 h-10.5 pointer-events-none"
        viewBox="0 0 80 42"
        fill="none"
      >
        <line
          x1="20"
          y1="0"
          x2="80"
          y2="42"
          stroke="rgba(96,165,250,0.07)"
          strokeWidth="16"
        />
        <line
          x1="45"
          y1="0"
          x2="80"
          y2="28"
          stroke="rgba(96,165,250,0.05)"
          strokeWidth="8"
        />
        <rect
          x="60"
          y="0"
          width="20"
          height="20"
          fill="rgba(96,165,250,0.06)"
        />
      </svg>

      <svg
        className="absolute bottom-0 right-0 w-15 h-15 pointer-events-none"
        viewBox="0 0 60 60"
        fill="none"
      >
        <path
          d="M 60 60 A 52 52 0 0 0 8 60"
          stroke="rgba(96,165,250,0.1)"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <path
          d="M 60 60 A 36 36 0 0 0 24 60"
          stroke="rgba(96,165,250,0.1)"
          strokeWidth="0.7"
          opacity="0.5"
        />
        <circle
          cx="58"
          cy="58"
          r="1.5"
          fill="rgba(96,165,250,0.2)"
          opacity="0.6"
        />
      </svg>

      <div className="absolute -bottom-5 -left-4 w-20 h-20 rounded-full pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.15)_0%,transparent_70%)]" />

      <div className="shrink-0 flex items-center gap-2.5 px-3.5 z-10 h-full border-r border-white/10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
          <div className="relative w-6.5 h-6.5 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)]">
            <Volume2 size={12} color="white" strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="absolute left-12.5 top-0 bottom-0 w-8 z-10 pointer-events-none bg-linear-to-r from-[#0f0f1a] to-transparent" />

      <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-linear-to-l from-[#16213e] to-transparent" />

      <div className="flex-1 overflow-hidden z-1">
        <Marquee speed={38} gradient={false} pauseOnHover pauseOnClick loop={0}>
          {messages.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 mx-7">
              <span
                className="inline-block w-1.25 h-1.25 rounded-full shrink-0"
                style={{
                  background: msg.accent,
                  boxShadow: `0 0 5px ${msg.accent}`,
                }}
              />
              <span className="text-[11px] font-medium text-white/70 whitespace-nowrap tracking-[0.01em]">
                {msg.text}
              </span>
              <Sparkles
                size={9}
                color={msg.accent}
                className="opacity-60 shrink-0"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
