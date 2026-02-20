"use client";

import { Volume2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Marquee from "react-fast-marquee";

export default function SpeakerMarquee() {
  const t = useTranslations("common");

  const messages = [
    { text: t("discovering") },
    { text: t("rememberReturn") },
    { text: t("readFavorite") },
    { text: t("knowledgeInvestment") },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-linear-to-r from-emerald-500/10 via-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-emerald-950/5 rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-800/50 py-2">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-linear-to-r from-emerald-50 via-emerald-50/80 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/15 z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-linear-to-l from-emerald-50 via-emerald-50/80 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/15 z-10" />

      <div className="relative flex items-center gap-2">
        <div className="flex items-center gap-2 pl-3 z-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />

            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20">
              <Volume2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          <div className="h-5 w-px bg-linear-to-b from-transparent via-emerald-300/30 to-transparent dark:via-emerald-700/30" />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <Marquee
            speed={40}
            gradient={false}
            pauseOnHover={true}
            pauseOnClick={true}
            delay={0}
            loop={0}
            className="flex"
          >
            {messages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2 group mx-4">
                <span className="text-xs font-medium bg-linear-to-r from-emerald-700 to-emerald-900 dark:from-emerald-300 dark:to-emerald-100 bg-clip-text text-transparent whitespace-nowrap">
                  {msg.text}
                </span>

                <Sparkles className="h-2.5 w-2.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </Marquee>
        </div>

        <div className="pr-3 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-linear-to-r from-transparent via-emerald-400/30 to-transparent" />
    </div>
  );
}
