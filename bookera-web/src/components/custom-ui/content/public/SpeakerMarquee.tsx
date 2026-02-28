"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import Botera from "@/assets/logo/botera.png";

export default function SpeakerMarquee() {
  const messages = [
    { text: "Discovering thousands of best book collections", accent: "#34d399" },
    { text: "Don't forget to return books on time", accent: "#10b981" },
    { text: "Read your favorite book today", accent: "#059669" },
    { text: "Knowledge is the best investment", accent: "#047857" },
  ];

  return (
    <div className="relative pt-5">
      <div className="relative flex items-center h-12.5 overflow-visible rounded-2xl bg-linear-to-r from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]">
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <svg
            className="absolute top-0 right-0 w-20 h-10.5"
            viewBox="0 0 80 42"
            fill="none"
          >
            <line
              x1="20"
              y1="0"
              x2="80"
              y2="42"
              stroke="rgba(16,185,129,0.07)"
              strokeWidth="16"
            />
            <line
              x1="45"
              y1="0"
              x2="80"
              y2="28"
              stroke="rgba(16,185,129,0.05)"
              strokeWidth="8"
            />
            <rect
              x="60"
              y="0"
              width="20"
              height="20"
              fill="rgba(16,185,129,0.06)"
            />
          </svg>

          <svg
            className="absolute bottom-0 right-0 w-15 h-15"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M 60 60 A 52 52 0 0 0 8 60"
              stroke="rgba(16,185,129,0.1)"
              strokeWidth="0.8"
              opacity="0.7"
            />
            <path
              d="M 60 60 A 36 36 0 0 0 24 60"
              stroke="rgba(16,185,129,0.1)"
              strokeWidth="0.7"
              opacity="0.5"
            />
            <circle
              cx="58"
              cy="58"
              r="1.5"
              fill="rgba(16,185,129,0.2)"
              opacity="0.6"
            />
          </svg>

          <div className="absolute -bottom-5 -left-4 w-20 h-20 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
        </div>

        <div className="shrink-0 relative z-20 flex items-end h-full pl-3 pr-2.5">
          <div
            className="absolute bottom-0 left-2.5"
            style={{ width: 52, height: 68 }}
          >
            <div
              className="absolute inset-0 rounded-full blur-md opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(16,185,129,0.45) 0%, transparent 70%)",
              }}
            />
            <Image
              src={Botera}
              alt="Bot"
              fill
              className="object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            />
          </div>
          <div style={{ width: 52, height: "100%" }} />
        </div>

        <div className="absolute left-18 top-0 bottom-0 w-8 z-10 pointer-events-none bg-linear-to-r from-[#0f0f1a] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-linear-to-l from-[#16213e] to-transparent rounded-r-full" />

        <div className="flex-1 overflow-hidden z-1">
          <Marquee
            speed={38}
            gradient={false}
            pauseOnHover
            pauseOnClick
            loop={0}
          >
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
    </div>
  );
}
