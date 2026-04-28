"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";
import { Sparkles } from "lucide-react";

interface ChatbotTriggerProps {
  isOpen: boolean;
  hasUnread: boolean;
  onOpen: () => void;
}

export function ChatbotTrigger({
  isOpen,
  hasUnread,
  onOpen,
}: ChatbotTriggerProps) {
  const t = useTranslations("chatbot");

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 flex flex-col items-end gap-3 transition-all duration-200",
      )}
    >
      {hasUnread && !isOpen && (
        <Badge className="animate-fade-in bg-linear-to-r from-brand-primary to-brand-primary-dark text-white text-[11px] rounded-full px-3 py-1 shadow-lg shadow-brand-primary/40 font-medium backdrop-blur-sm">
          <Sparkles className="w-3 h-3 mr-1 inline" />
          {t("unreadBadge")}
        </Badge>
      )}

      <button
        id="chatbot-toggle-btn"
        onClick={onOpen}
        aria-label="Buka Botera AI"
        className={cn(
          "group relative w-16 h-16 rounded-full flex items-center justify-center",
          "bg-linear-to-br from-brand-primary via-brand-primary-dark to-purple-600",
          "shadow-2xl shadow-brand-primary/50",
          "transition-all duration-500 ease-out",
          "hover:scale-110 hover:shadow-3xl hover:shadow-brand-primary/60",
          "focus:outline-none focus:ring-4 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-background",
          "before:absolute before:inset-0 before:rounded-full before:p-[2px]",
          "before:bg-linear-to-r before:from-white/30 before:via-transparent before:to-white/30",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
          "overflow-hidden",
        )}
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute -inset-1 rounded-full bg-linear-to-r from-brand-primary via-purple-500 to-brand-primary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

        <div
          className={cn(
            "relative w-9 h-9 transition-all duration-500",
            "group-hover:scale-110",
            "group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
          )}
        >
          <Image
            src={boteraLogo}
            alt="Botera"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
        </div>

        {hasUnread && (
          <>
            <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-linear-to-br from-red-500 to-red-600 rounded-full border-2 border-background animate-ping opacity-75" />
            <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-linear-to-br from-red-500 to-red-600 rounded-full border-2 border-background shadow-lg shadow-red-500/50">
              <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            </span>
          </>
        )}

        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full rounded-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
      </button>
    </div>
  );
}
