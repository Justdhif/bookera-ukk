"use client";

import { Volume2, Sparkles } from "lucide-react";

const messages = [
  { text: "Temukan ribuan koleksi buku terbaik" },
  { text: "Jangan lupa kembalikan buku tepat waktu" },
  { text: "Baca buku favoritmu hari ini" },
  { text: "Ilmu adalah investasi terbaik" },
];

export default function SpeakerMarquee() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-emerald-950/5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-800/50 py-2">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
      </div>

      {/* Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/15 z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-emerald-50 via-emerald-50/80 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/15 z-10" />

      <div className="relative flex items-center gap-2">
        {/* Speaker Icon Container */}
        <div className="flex items-center gap-2 pl-3 z-10">
          <div className="relative">
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />

            {/* Icon Background */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20">
              <Volume2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-gradient-to-b from-transparent via-emerald-300/30 to-transparent dark:via-emerald-700/30" />
        </div>

        {/* Marquee Container */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-8 animate-marquee">
            {messages
              .concat(messages)
              .concat(messages)
              .map((msg, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  {/* Text */}
                  <span className="text-xs font-medium bg-gradient-to-r from-emerald-700 to-emerald-900 dark:from-emerald-300 dark:to-emerald-100 bg-clip-text text-transparent whitespace-nowrap">
                    {msg.text}
                  </span>

                  {/* Sparkle Accent */}
                  <Sparkles className="h-2.5 w-2.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
          </div>
        </div>

        {/* Trailing Decoration */}
        <div className="pr-3 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
    </div>
  );
}
