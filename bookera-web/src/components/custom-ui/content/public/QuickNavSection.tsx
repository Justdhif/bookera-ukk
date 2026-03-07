"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

function SlashLines({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-0 h-18 w-18"
      viewBox="0 0 72 72"
      fill="none"
    >
      <line x1="20" y1="0" x2="72" y2="52" stroke={color} strokeWidth="16" />
      <line
        x1="40"
        y1="0"
        x2="72"
        y2="32"
        stroke={color}
        strokeWidth="8"
        opacity="0.6"
      />
      <line
        x1="56"
        y1="0"
        x2="72"
        y2="16"
        strokeWidth="3.5"
        stroke={color}
        opacity="0.4"
      />
      <rect x="52" y="0" width="20" height="20" fill={color} opacity="0.45" />
      <rect
        x="56"
        y="3"
        width="13"
        height="13"
        fill="none"
        stroke={color}
        strokeWidth="0.7"
        opacity="0.4"
      />
    </svg>
  );
}

function HexGrid({ color }: { color: string }) {
  const hexPath = "M10,0 L20,6 L20,18 L10,24 L0,18 L0,6 Z";
  const positions = [
    { x: -4, y: 8 },
    { x: 12, y: -1 },
    { x: 12, y: 17 },
    { x: -4, y: 26 },
    { x: 28, y: 8 },
  ];
  return (
    <svg
      className="pointer-events-none absolute left-0 top-[20%] h-20 w-14 opacity-70"
      viewBox="0 0 56 80"
      fill="none"
    >
      {positions.map((pos, i) => (
        <path
          key={i}
          d={hexPath}
          transform={`translate(${pos.x},${pos.y})`}
          fill={color}
          stroke={color}
          strokeWidth="0.7"
          fillOpacity="0.18"
          strokeOpacity="0.55"
        />
      ))}
    </svg>
  );
}

function ArcDecor({ color }: { color: string }) {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 h-13 w-13"
      viewBox="0 0 52 52"
      fill="none"
    >
      <path
        d="M52 52 A46 46 0 0 0 6 52"
        stroke={color}
        strokeWidth="0.9"
        opacity="0.7"
      />
      <path
        d="M52 52 A30 30 0 0 0 22 52"
        stroke={color}
        strokeWidth="0.7"
        opacity="0.5"
      />
      <path
        d="M52 52 A16 16 0 0 0 36 52"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.35"
      />
      <circle cx="50" cy="50" r="1.5" fill={color} opacity="0.6" />
    </svg>
  );
}

const navItems = [
  {
    label: "My Borrows",
    href: "/my-borrows",
    Icon: BookOpen,
    iconGradient: "bg-linear-to-br from-orange-500 to-red-500",
    borderCls: "border-orange-500/40 hover:border-orange-500/70",
    hoverBg: "hover:bg-orange-500/10",
    glowCls: "from-orange-500/30",
    orbColor: "rgba(249,115,22,0.30)",
    corakColor: "rgba(234,88,12,1)",
    accentLine: "from-orange-500/50",
    labelCls: "text-orange-900 dark:text-orange-100",
    bgLight: "linear-gradient(150deg,#ffedd5 0%,#fdba74 50%,#fb923c 100%)",
    bgDark: "linear-gradient(150deg,#220e00 0%,#3b1500 50%,#4e1d00 100%)",
  },
  {
    label: "My Fines",
    href: "/my-fines",
    Icon: DollarSign,
    iconGradient: "bg-linear-to-br from-rose-500 to-red-500",
    borderCls: "border-rose-500/40 hover:border-rose-500/70",
    hoverBg: "hover:bg-rose-500/10",
    glowCls: "from-rose-500/30",
    orbColor: "rgba(244,63,94,0.30)",
    corakColor: "rgba(225,29,72,1)",
    accentLine: "from-rose-500/50",
    labelCls: "text-rose-900 dark:text-rose-100",
    bgLight: "linear-gradient(150deg,#ffe4e6 0%,#fda4af 50%,#fb7185 100%)",
    bgDark: "linear-gradient(150deg,#220008 0%,#3a000f 50%,#4e0015 100%)",
  },
  {
    label: "Discussion",
    href: "/forum",
    Icon: MessageSquare,
    iconGradient: "bg-linear-to-br from-violet-500 to-purple-600",
    borderCls: "border-violet-500/40 hover:border-violet-500/70",
    hoverBg: "hover:bg-violet-500/10",
    glowCls: "from-violet-500/30",
    orbColor: "rgba(139,92,246,0.30)",
    corakColor: "rgba(109,40,217,1)",
    accentLine: "from-violet-500/50",
    labelCls: "text-violet-900 dark:text-violet-100",
    bgLight: "linear-gradient(150deg,#ede9fe 0%,#c4b5fd 50%,#a78bfa 100%)",
    bgDark: "linear-gradient(150deg,#0f061e 0%,#1e0f44 50%,#2d185c 100%)",
  },
];

export default function QuickNavSection() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex h-full flex-row gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{ background: isDark ? item.bgDark : item.bgLight }}
          className={`relative flex h-auto flex-1 flex-col items-center justify-center gap-0 overflow-hidden rounded-xl border py-5 transition-all duration-200 ${item.borderCls} ${item.hoverBg}`}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background: `radial-gradient(ellipse at 50% 120%, ${item.orbColor} 0%, transparent 65%)`,
            }}
          />

          <SlashLines color={item.corakColor} />
          <HexGrid color={item.corakColor} />
          <ArcDecor color={item.corakColor} />

          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t ${item.glowCls} to-transparent z-1`}
          />

          <div className="relative z-10 flex w-full flex-col items-center gap-3 px-2">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${item.iconGradient}`}
            >
              <item.Icon size={18} strokeWidth={2} className="text-white" />
            </div>

            <p
              className={`text-[11px] font-bold leading-tight tracking-tight ${item.labelCls}`}
            >
              {item.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
