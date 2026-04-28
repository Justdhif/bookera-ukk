"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";
import { useChatbotStore } from "@/store/chatbot.store";
import { useTranslations } from "next-intl";
import { ChatbotWidget } from "@/components/custom-ui/ChatbotWidget";

export default function ChatbotHeaderTrigger() {
  const { isOpen, setIsOpen, hasUnread } = useChatbotStore();
  const t = useTranslations("chatbot");

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative flex items-center gap-2 h-9 md:h-10 px-3 md:px-4 transition-all duration-300",
          "border-brand-primary/20 hover:border-brand-primary/40",
          "group overflow-hidden bg-linear-to-br from-background to-muted/30 hover:to-brand-primary/5 shadow-xs",
          isOpen && "border-brand-primary/50 bg-brand-primary/5 shadow-brand-primary/10"
        )}
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary/0 via-brand-primary/10 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-40" />
        
        <div className="relative flex items-center gap-2 md:gap-2.5">
          <div className={cn(
            "relative w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center p-0.5 md:p-1",
            "bg-linear-to-br from-brand-primary via-brand-primary-dark to-purple-600 shadow-md",
            "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-brand-primary/30 transition-all duration-500 ease-out",
            "after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-white/30 after:ring-inset"
          )}>
            <Image 
              src={boteraLogo} 
              alt="Botera" 
              className="w-full h-full object-contain filter brightness-110 drop-shadow-sm" 
            />
          </div>
          
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="font-bold text-[11px] md:text-[13px] text-foreground group-hover:text-brand-primary transition-colors duration-300">
              {t("title")}
            </span>
            <span className="text-[8px] md:text-[9px] text-muted-foreground font-semibold uppercase tracking-widest opacity-80 group-hover:opacity-100 group-hover:text-brand-primary/80 transition-all duration-300">
              Virtual Assistant
            </span>
          </div>
          
          <div className="flex items-center justify-center ml-0.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary/60 group-hover:text-brand-primary group-hover:rotate-12 transition-all duration-500" />
          </div>
        </div>

        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-primary border border-background shadow-[0_0_10px_rgba(var(--brand-primary),0.8)]"></span>
          </span>
        )}

        {/* Premium Border Highlight */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </Button>

      <ChatbotWidget />
    </>
  );
}
