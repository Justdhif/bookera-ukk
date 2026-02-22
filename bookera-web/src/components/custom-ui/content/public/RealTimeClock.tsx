"use client";

import { useEffect, useState } from "react";
import { Thermometer, Droplets, MapPin, BookMarked } from "lucide-react";

type Theme = {
  id: string;
  bg: string;
  bgOverlay: string;
  textPrimary: string;
  textDim: string;
  textMuted: string;
  greeting: string;
  surface: string;
  surfaceBorder: string;
  divider: string;
  accent: string;
  orbColor: string;
  geoStroke: string;
  geoFill: string;
};

const themes: Record<string, Theme> = {
  dawn: {
    id: "dawn",
    bg: "linear-gradient(150deg, #12011f 0%, #4a1060 45%, #c05a10 100%)",
    bgOverlay: "radial-gradient(ellipse at 80% 0%, rgba(200,100,30,0.18) 0%, transparent 60%)",
    textPrimary: "#fef0e0",
    textDim: "rgba(254,230,200,0.65)",
    textMuted: "rgba(220,170,120,0.4)",
    greeting: "Selamat Pagi",
    surface: "rgba(255,170,60,0.08)",
    surfaceBorder: "rgba(255,170,60,0.16)",
    divider: "rgba(255,160,60,0.12)",
    accent: "#f0854a",
    orbColor: "rgba(240,133,74,0.35)",
    geoStroke: "rgba(240,133,74,0.2)",
    geoFill: "rgba(240,133,74,0.04)",
  },
  morning: {
    id: "morning",
    bg: "linear-gradient(150deg, #7c2d00 0%, #c45000 45%, #f59e0b 100%)",
    bgOverlay: "radial-gradient(ellipse at 70% 10%, rgba(255,220,80,0.2) 0%, transparent 55%)",
    textPrimary: "#ffffff",
    textDim: "rgba(255,255,255,0.7)",
    textMuted: "rgba(255,255,255,0.38)",
    greeting: "Selamat Pagi",
    surface: "rgba(255,255,255,0.1)",
    surfaceBorder: "rgba(255,255,255,0.2)",
    divider: "rgba(255,255,255,0.14)",
    accent: "#fde68a",
    orbColor: "rgba(253,230,138,0.3)",
    geoStroke: "rgba(255,255,255,0.14)",
    geoFill: "rgba(255,255,255,0.04)",
  },
  midday: {
    id: "midday",
    bg: "linear-gradient(150deg, #003560 0%, #0369a1 50%, #38bdf8 100%)",
    bgOverlay: "radial-gradient(ellipse at 75% 5%, rgba(125,220,255,0.2) 0%, transparent 55%)",
    textPrimary: "#ffffff",
    textDim: "rgba(255,255,255,0.7)",
    textMuted: "rgba(200,235,255,0.38)",
    greeting: "Selamat Siang",
    surface: "rgba(255,255,255,0.1)",
    surfaceBorder: "rgba(255,255,255,0.2)",
    divider: "rgba(255,255,255,0.13)",
    accent: "#bae6fd",
    orbColor: "rgba(56,189,248,0.32)",
    geoStroke: "rgba(255,255,255,0.14)",
    geoFill: "rgba(255,255,255,0.04)",
  },
  afternoon: {
    id: "afternoon",
    bg: "linear-gradient(150deg, #7c1c00 0%, #c2340a 50%, #fb923c 100%)",
    bgOverlay: "radial-gradient(ellipse at 72% 8%, rgba(255,200,100,0.18) 0%, transparent 55%)",
    textPrimary: "#ffffff",
    textDim: "rgba(255,255,255,0.7)",
    textMuted: "rgba(255,220,180,0.38)",
    greeting: "Selamat Sore",
    surface: "rgba(255,255,255,0.09)",
    surfaceBorder: "rgba(255,255,255,0.18)",
    divider: "rgba(255,255,255,0.12)",
    accent: "#fed7aa",
    orbColor: "rgba(251,146,60,0.35)",
    geoStroke: "rgba(255,255,255,0.13)",
    geoFill: "rgba(255,255,255,0.04)",
  },
  dusk: {
    id: "dusk",
    bg: "linear-gradient(150deg, #1e003c 0%, #7b1550 50%, #d97706 100%)",
    bgOverlay: "radial-gradient(ellipse at 78% 5%, rgba(220,120,20,0.2) 0%, transparent 55%)",
    textPrimary: "#fff7ed",
    textDim: "rgba(255,230,190,0.65)",
    textMuted: "rgba(220,170,100,0.38)",
    greeting: "Selamat Sore",
    surface: "rgba(255,160,50,0.08)",
    surfaceBorder: "rgba(255,160,50,0.16)",
    divider: "rgba(255,150,40,0.12)",
    accent: "#fbbf24",
    orbColor: "rgba(217,119,6,0.35)",
    geoStroke: "rgba(251,191,36,0.18)",
    geoFill: "rgba(251,191,36,0.04)",
  },
  night: {
    id: "night",
    bg: "linear-gradient(150deg, #020616 0%, #0c1445 50%, #1e3a8a 100%)",
    bgOverlay: "radial-gradient(ellipse at 70% 5%, rgba(100,130,255,0.15) 0%, transparent 55%)",
    textPrimary: "#e0e7ff",
    textDim: "rgba(180,195,255,0.62)",
    textMuted: "rgba(140,160,230,0.36)",
    greeting: "Selamat Malam",
    surface: "rgba(100,130,255,0.07)",
    surfaceBorder: "rgba(100,130,255,0.15)",
    divider: "rgba(100,130,255,0.1)",
    accent: "#818cf8",
    orbColor: "rgba(99,102,241,0.3)",
    geoStroke: "rgba(100,130,255,0.15)",
    geoFill: "rgba(100,130,255,0.03)",
  },
  midnight: {
    id: "midnight",
    bg: "linear-gradient(150deg, #000000 0%, #05001a 55%, #0d0030 100%)",
    bgOverlay: "radial-gradient(ellipse at 65% 5%, rgba(80,60,180,0.12) 0%, transparent 55%)",
    textPrimary: "rgba(210,215,255,0.9)",
    textDim: "rgba(170,178,240,0.55)",
    textMuted: "rgba(120,130,210,0.35)",
    greeting: "Selamat Malam",
    surface: "rgba(80,90,220,0.06)",
    surfaceBorder: "rgba(80,90,220,0.12)",
    divider: "rgba(80,90,220,0.08)",
    accent: "#6366f1",
    orbColor: "rgba(79,70,229,0.28)",
    geoStroke: "rgba(80,90,220,0.12)",
    geoFill: "rgba(80,90,220,0.03)",
  },
};

function getTheme(h: number): Theme {
  if (h >= 4 && h < 6) return themes.dawn;
  if (h >= 6 && h < 10) return themes.morning;
  if (h >= 10 && h < 15) return themes.midday;
  if (h >= 15 && h < 17) return themes.afternoon;
  if (h >= 17 && h < 19) return themes.dusk;
  if (h >= 19 && h < 23) return themes.night;
  return themes.midnight;
}

function SlashLines({ stroke }: { stroke: string }) {
  return (
    <svg
      style={{ position: "absolute", top: 0, right: 0, width: "130px", height: "130px", pointerEvents: "none" }}
      viewBox="0 0 130 130"
      fill="none"
    >
      <line x1="40" y1="0" x2="130" y2="90" stroke={stroke} strokeWidth="28" />
      <line x1="70" y1="0" x2="130" y2="60" stroke={stroke} strokeWidth="14" opacity="0.6" />
      <line x1="95" y1="0" x2="130" y2="35" stroke={stroke} strokeWidth="6" opacity="0.4" />
      <rect x="95" y="0" width="35" height="35" fill={stroke} opacity="0.55" />
      <rect x="100" y="5" width="25" height="25" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function HexGrid({ stroke }: { stroke: string }) {
  const hexPath = "M16,0 L32,9 L32,27 L16,36 L0,27 L0,9 Z";
  const positions = [
    { x: -8, y: 60 }, { x: 20, y: 43 }, { x: 20, y: 77 },
    { x: -8, y: 96 }, { x: 48, y: 60 }, { x: 48, y: 26 },
  ];
  return (
    <svg
      style={{ position: "absolute", left: 0, top: "30%", width: "90px", height: "130px", pointerEvents: "none", opacity: 0.6 }}
      viewBox="0 0 90 130"
      fill="none"
    >
      {positions.map((pos, i) => (
        <path
          key={i}
          d={hexPath}
          transform={`translate(${pos.x}, ${pos.y})`}
          fill={stroke.replace("0.2", "0.04").replace("0.15", "0.03")}
          stroke={stroke}
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}

function ArcDecor({ stroke }: { stroke: string }) {
  return (
    <svg
      style={{ position: "absolute", bottom: 0, right: 0, width: "90px", height: "90px", pointerEvents: "none" }}
      viewBox="0 0 90 90"
      fill="none"
    >
      <path d="M 90 90 A 80 80 0 0 0 10 90" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path d="M 90 90 A 58 58 0 0 0 32 90" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
      <path d="M 90 90 A 36 36 0 0 0 54 90" stroke={stroke} strokeWidth="0.7" opacity="0.35" />
      <circle cx="88" cy="88" r="2.5" fill={stroke} opacity="0.6" />
    </svg>
  );
}

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [weather, setWeather] = useState<{ temp: number | null; humidity: number | null; loading: boolean }>({
    temp: null, humidity: null, loading: true,
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current=temperature_2m,relative_humidity_2m&timezone=Asia%2FJakarta"
        );
        const data = await res.json();
        setWeather({ temp: Math.round(data.current.temperature_2m), humidity: data.current.relative_humidity_2m, loading: false });
      } catch {
        setWeather({ temp: 29, humidity: 85, loading: false });
      }
    }
    fetchWeather();
    const wt = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(wt);
  }, []);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => {
      setTime(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 280);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  if (!mounted) return null;

  const hour = time.getHours();
  const theme = getTheme(hour);

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const dayName = days[time.getDay()];
  const dateNum = time.getDate();
  const monthName = months[time.getMonth()];
  const year = time.getFullYear();
  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");

  const tempVal = weather.loading ? "···" : `${weather.temp}°`;
  const humVal = weather.loading ? "···" : `${weather.humidity}%`;

  return (
    <div style={{
      background: theme.bg,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: "background 2.5s ease",
      borderRadius: "18px",
      padding: "18px 20px",
      height: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      position: "relative",
      overflow: "hidden",
    }}>

      <div style={{
        position: "absolute", inset: 0, background: theme.bgOverlay,
        borderRadius: "18px", pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute",
        bottom: "-55px",
        left: "-35px",
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.orbColor} 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <SlashLines stroke={theme.geoFill.replace("0.04", "0.09")} />
      <HexGrid stroke={theme.geoStroke} />
      <ArcDecor stroke={theme.geoStroke} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
          <BookMarked size={10} color={theme.textMuted} strokeWidth={2} />
          <span style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: theme.textMuted,
          }}>
            Perpustakaan Umum
          </span>
          <span style={{ fontSize: "9px", color: theme.textMuted, opacity: 0.5, margin: "0 2px" }}>·</span>
          <MapPin size={9} color={theme.textMuted} strokeWidth={2} />
          <span style={{ fontSize: "9px", color: theme.textMuted, letterSpacing: "0.1em" }}>Jakarta</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{
            fontSize: "20px", fontWeight: 800, color: theme.textPrimary,
            letterSpacing: "-0.025em", lineHeight: 1,
          }}>
            {theme.greeting}
          </span>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: theme.textDim, letterSpacing: "-0.01em" }}>
              {dateNum} {monthName.slice(0, 3)} {year}
            </div>
            <div style={{ fontSize: "9px", color: theme.textMuted, marginTop: "1px", letterSpacing: "0.06em" }}>
              {dayName}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 1, height: "1px",
        background: `linear-gradient(90deg, ${theme.accent}30, ${theme.divider}, transparent)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px" }}>
          <span style={{
            fontSize: "64px", fontWeight: 900, color: theme.textPrimary,
            letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}>
            {hh}
          </span>
          <span style={{
            fontSize: "52px", fontWeight: 300, color: theme.accent,
            opacity: pulse ? 1 : 0.2,
            transition: "opacity 0.15s ease",
            lineHeight: 1,
            alignSelf: "center",
            marginBottom: "4px",
          }}>:</span>
          <span style={{
            fontSize: "64px", fontWeight: 900, color: theme.textPrimary,
            letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}>
            {mm}
          </span>
          <div style={{ marginLeft: "6px", marginBottom: "6px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end" }}>
            <span style={{
              fontSize: "22px", fontWeight: 700, color: theme.accent,
              fontVariantNumeric: "tabular-nums", lineHeight: 1,
            }}>
              {ss}
            </span>
            <span style={{ fontSize: "8px", color: theme.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              detik
            </span>
          </div>
        </div>
      </div>

      <div style={{
        position: "relative", zIndex: 1, height: "1px",
        background: `linear-gradient(90deg, transparent, ${theme.divider}, ${theme.accent}25)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "8px" }}>
        {[
          { label: "Suhu", value: tempVal, Icon: Thermometer, sub: "Jakarta" },
          { label: "Kelembapan", value: humVal, Icon: Droplets, sub: "Relatif" },
          { label: "Zona Waktu", value: "WIB", Icon: MapPin, sub: "UTC+7" },
        ].map(({ label, value, Icon, sub }) => (
          <div key={label} style={{
            flex: 1,
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: "10px",
            padding: "9px 8px 8px",
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", left: 0, top: "20%", bottom: "20%",
              width: "2px", borderRadius: "0 2px 2px 0",
              background: theme.accent, opacity: 0.5,
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <Icon size={10} color={theme.accent} strokeWidth={2} />
              <span style={{ fontSize: "8.5px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: theme.textPrimary, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontSize: "8px", color: theme.textMuted, marginTop: "2px", letterSpacing: "0.06em" }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}