"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Megaphone, CalendarDays, Lightbulb, ArrowRight, ChevronRight } from "lucide-react";
const contents = [
  {
    id: 1,
    category: "Berita",
    title: "Launching koleksi buku baru minggu depan!",
    time: "2 jam lalu",
    Icon: Newspaper,
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.12)",
    accentBorder: "rgba(96,165,250,0.22)",
  },
  {
    id: 2,
    category: "Promo",
    title: "Diskon 20% peminjaman premium bulan ini",
    time: "Hari ini",
    Icon: Megaphone,
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.12)",
    accentBorder: "rgba(52,211,153,0.22)",
  },
  {
    id: 3,
    category: "Event",
    title: "Webinar literasi gratis — daftar sekarang!",
    time: "Besok",
    Icon: CalendarDays,
    accent: "#c084fc",
    accentBg: "rgba(192,132,252,0.12)",
    accentBorder: "rgba(192,132,252,0.22)",
  },
  {
    id: 4,
    category: "Tips",
    title: "5 cara memaksimalkan pencarian katalog",
    time: "3 jam lalu",
    Icon: Lightbulb,
    accent: "#fbbf24",
    accentBg: "rgba(251,191,36,0.12)",
    accentBorder: "rgba(251,191,36,0.22)",
  },
];

function SlashLines({ stroke }: { stroke: string }) {
  return (
    <svg
      style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", pointerEvents: "none" }}
      viewBox="0 0 100 100"
      fill="none"
    >
      <line x1="30" y1="0" x2="100" y2="70" stroke={stroke} strokeWidth="20" />
      <line x1="58" y1="0" x2="100" y2="42" stroke={stroke} strokeWidth="10" opacity="0.6" />
      <line x1="78" y1="0" x2="100" y2="22" stroke={stroke} strokeWidth="4" opacity="0.4" />
      <rect x="75" y="0" width="25" height="25" fill={stroke} opacity="0.5" />
    </svg>
  );
}

function ArcDecor({ stroke }: { stroke: string }) {
  return (
    <svg
      style={{ position: "absolute", bottom: 0, right: 0, width: "70px", height: "70px", pointerEvents: "none" }}
      viewBox="0 0 70 70"
      fill="none"
    >
      <path d="M 70 70 A 62 62 0 0 0 8 70" stroke={stroke} strokeWidth="0.9" opacity="0.7" />
      <path d="M 70 70 A 44 44 0 0 0 26 70" stroke={stroke} strokeWidth="0.7" opacity="0.5" />
      <path d="M 70 70 A 26 26 0 0 0 44 70" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
      <circle cx="68" cy="68" r="2" fill={stroke} opacity="0.55" />
    </svg>
  );
}

export default function LiveSectionContent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const INTERVAL = 5000;

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % contents.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const tick = 50;
    const step = (tick / INTERVAL) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          next();
          return 0;
        }
        return prev + step;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [next]);

  const current = contents[currentIndex];
  const geoStroke = current.accentBorder;

  return (
    <div
      style={{
        background: "linear-gradient(150deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        borderRadius: "18px",
        padding: "14px 16px",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={() => router.push("/news")}
    >
      <div style={{
        position: "absolute",
        bottom: "-40px",
        left: "-25px",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${current.accentBg.replace("0.12", "0.25")} 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
        transition: "background 0.6s ease",
      }} />

      <SlashLines stroke={current.accentBg.replace("0.12", "0.08")} />
      <ArcDecor stroke={geoStroke} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{
            display: "inline-block",
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: current.accent,
            boxShadow: `0 0 6px ${current.accent}`,
          }} />
          <span style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.38)",
          }}>
            Update Terkini
          </span>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: "3px",
            fontSize: "9px", fontWeight: 600,
            color: current.accent,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Lihat Semua
          <ChevronRight size={10} strokeWidth={2.5} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div style={{
              flexShrink: 0,
              width: "34px", height: "34px",
              borderRadius: "10px",
              background: current.accentBg,
              border: `1px solid ${current.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <current.Icon size={16} color={current.accent} strokeWidth={1.8} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                <span style={{
                  fontSize: "9px", fontWeight: 700,
                  color: current.accent,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  background: current.accentBg,
                  border: `1px solid ${current.accentBorder}`,
                  borderRadius: "4px",
                  padding: "1px 5px",
                }}>
                  {current.category}
                </span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>
                  {current.time}
                </span>
              </div>
              <p style={{
                fontSize: "12px", fontWeight: 600,
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {current.title}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              alignSelf: "flex-end",
              fontSize: "10px", fontWeight: 700,
              color: current.accent,
              letterSpacing: "0.04em",
              background: current.accentBg,
              border: `1px solid ${current.accentBorder}`,
              borderRadius: "6px",
              padding: "4px 8px",
              transition: "opacity 0.2s",
            }}
          >
            Baca Selengkapnya
            <ArrowRight size={11} strokeWidth={2.5} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{
          flex: 1, height: "2px", borderRadius: "2px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: current.accent,
            borderRadius: "2px",
            transition: "width 0.05s linear",
            boxShadow: `0 0 6px ${current.accent}80`,
          }} />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {contents.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setProgress(0); }}
              style={{
                width: i === currentIndex ? "14px" : "5px",
                height: "5px",
                borderRadius: "3px",
                background: i === currentIndex ? current.accent : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s ease",
                boxShadow: i === currentIndex ? `0 0 6px ${current.accent}80` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}