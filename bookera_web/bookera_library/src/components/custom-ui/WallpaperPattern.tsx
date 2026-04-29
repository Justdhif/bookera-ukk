"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";


type IconFn = (color: string, opacity: number) => React.ReactNode;

const ICONS: IconFn[] = [
  (c, o) => (
    <g opacity={o}>
      <path
        d="M16 7C16 7 12 5 6 5V26C12 26 16 28 16 28M16 7C16 7 20 5 26 5V26C20 26 16 28 16 28M16 7V28"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M7 4H21C21.5 4 22 4.45 22 5V25L14 19L6 25V5C6 4.45 6.45 4 7 4Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <circle cx="12" cy="12" r="7" stroke={c} strokeWidth="1.8" fill="none" />
      <path
        d="M17 17L23 23"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <circle cx="10" cy="16" r="5" stroke={c} strokeWidth="1.8" fill="none" />
      <circle cx="22" cy="16" r="5" stroke={c} strokeWidth="1.8" fill="none" />
      <path
        d="M5 16C3 13 3 10 5 8"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M27 16C29 13 29 10 27 8"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 16H17"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M15 27V18M15 18L8 10H22L15 18Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 27H20"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M4 24L8 20L20 8L24 12L12 24L4 24Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 8L24 12"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <rect
        x="4"
        y="20"
        width="24"
        height="6"
        rx="1"
        stroke={c}
        strokeWidth="1.8"
        fill="none"
      />
      <rect
        x="7"
        y="13"
        width="18"
        height="7"
        rx="1"
        stroke={c}
        strokeWidth="1.8"
        fill="none"
      />
      <rect
        x="10"
        y="7"
        width="12"
        height="6"
        rx="1"
        stroke={c}
        strokeWidth="1.8"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M6 24C10 18 14 12 24 6C20 10 18 16 20 22M6 24L20 22M6 24L10 20"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 22L22 26"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <circle cx="15" cy="15" r="10" stroke={c} strokeWidth="1.8" fill="none" />
      <ellipse
        cx="15"
        cy="15"
        rx="4"
        ry="10"
        stroke={c}
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M5 15H25M7 10H23M7 20H23"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M15 3L17.5 10H25L19 14.5L21.5 21.5L15 17L8.5 21.5L11 14.5L5 10H12.5L15 3Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M15 8L4 14L15 20L26 14L15 8Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 17V23C9 23 12 26 15 26C18 26 21 23 21 23V17"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <circle cx="15" cy="15" r="10" stroke={c} strokeWidth="1.8" fill="none" />
      <path
        d="M15 8V15L19 18"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M15 5C10.5 5 7 8.5 7 13C7 16 9 18.5 11 20V22H19V20C21 18.5 23 16 23 13C23 8.5 19.5 5 15 5Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11 25H19M12 28H18"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M8 5C8 5 6 5 6 7V25C6 27 8 27 8 27H22C24 27 24 25 24 25V9L18 5H8Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18 5V9H24"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 14H20M10 18H20M10 22H16"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <circle cx="15" cy="15" r="10" stroke={c} strokeWidth="1.8" fill="none" />
      <path
        d="M15 9L12 18L15 16L18 18L15 9Z"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M9 5H21V14C21 17.3 18.3 20 15 20C11.7 20 9 17.3 9 14V5Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 8H5V11C5 13 6.5 14.5 9 15M21 8H25V11C25 13 23.5 14.5 21 15"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 20V24M10 27H20"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M15 22C15 22 4 15 4 10C4 7 6 5 9 5C11 5 13 6.5 15 9C17 6.5 19 5 21 5C24 5 26 7 26 10C26 15 15 22 15 22Z"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
  (c, o) => (
    <g opacity={o}>
      <path
        d="M6 24C6 24 8 12 20 6C20 6 22 18 10 22M6 24C6 24 10 18 16 14"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  ),
];

// ─── Dense brick-grid layout ──────────────────────────────────────────────────
const ICON_SIZE = 30; // rendered size (px)
const GAP = 8; // space between icons
const STEP = ICON_SIZE + GAP;

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

interface IconItem {
  x: number;
  y: number;
  iconIndex: number;
  opacity: number;
  rotation: number;
}

function buildGrid(w: number, h: number): IconItem[] {
  const rand = seededRng(777);
  const cols = Math.ceil(w / STEP) + 3;
  const rows = Math.ceil(h / STEP) + 3;
  const items: IconItem[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const stagger = row % 2 === 0 ? 0 : STEP * 0.5;
      items.push({
        x: col * STEP - STEP + stagger + (rand() - 0.5) * 6,
        y: row * STEP - STEP + (rand() - 0.5) * 6,
        iconIndex: Math.floor(rand() * ICONS.length),
        opacity: 0.04 + rand() * 0.08,
        rotation: (rand() - 0.5) * 50,
      });
    }
  }
  return items;
}



export function WallpaperPattern({
  className = "",
  bgColor,
  patternWidth = 1400,
  patternHeight = 900,
}: {
  className?: string;
  bgColor?: string;
  /** SVG pattern tile width — larger = fewer seams on big screens */
  patternWidth?: number;
  /** SVG pattern tile height */
  patternHeight?: number;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = buildGrid(patternWidth, patternHeight);
  const half = ICON_SIZE / 2;

  const isDark = resolvedTheme === "dark";
  const defaultBg = isDark ? "#0c0a09" : "#F5F0E8";
  const iconColor = isDark ? "#ffffff" : "#7C5C3E";
  const finalBgColor = bgColor || defaultBg;

  if (!mounted) {
    return (
      <div
        className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
        style={{ backgroundColor: isDark ? "#0c0a09" : "#F5F0E8" }}
      />
    );
  }

  return (
    <div
      className={cn("absolute inset-0 w-full h-full pointer-events-none overflow-hidden", className)}
      style={{ backgroundColor: finalBgColor }}
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <pattern
            id="libWallpaper"
            x="0"
            y="0"
            width={patternWidth}
            height={patternHeight}
            patternUnits="userSpaceOnUse"
          >
            <rect width={patternWidth} height={patternHeight} fill={finalBgColor} />
            {items.map((item, i) => {
              const IconFn = ICONS[item.iconIndex];
              return (
                <g
                  key={i}
                  transform={`translate(${item.x + half} ${item.y + half}) rotate(${item.rotation}) translate(${-half} ${-half})`}
                >
                  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 30 30">
                    {IconFn(iconColor, item.opacity)}
                  </svg>
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#libWallpaper)" />
      </svg>
    </div>
  );
}
