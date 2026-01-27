"use client";

import { Volume2 } from "lucide-react";

const messages = [
  "📚 Temukan ribuan koleksi buku terbaik",
  "⏰ Jangan lupa kembalikan buku tepat waktu",
  "✨ Baca buku favoritmu hari ini",
  "📖 Ilmu adalah investasi terbaik",
];

export default function SpeakerMarquee() {
  return (
    <div className="relative w-full overflow-hidden bg-muted py-3">
      {/* Fade Effect */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-muted to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-muted to-transparent z-10" />

      <div className="flex items-center gap-4">
        {/* Speaker */}
        <div className="flex items-center gap-2 pl-4 text-primary">
          <Volume2 className="h-5 w-5 animate-pulse" />
        </div>

        {/* Marquee */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-marquee">
            {messages.concat(messages).map((msg, i) => (
              <span
                key={i}
                className="text-sm font-medium text-muted-foreground"
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
