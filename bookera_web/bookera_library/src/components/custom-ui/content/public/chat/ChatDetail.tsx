"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "@/types/user";
import { Message } from "@/services/chat.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Send, MessageSquareText, X, ShieldAlert, AlertTriangle, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom-ui/EmptyState";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatDetailProps {
  activeUser: User | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string) => void;
  onClose?: () => void;
  className?: string;
  moderationAlert?: string | null;
  onDismissAlert?: () => void;
  isModerating?: boolean;
}

export default function ChatDetail({
  activeUser,
  messages,
  loading,
  onSendMessage,
  onClose,
  className,
  moderationAlert,
  onDismissAlert,
  isModerating,
}: ChatDetailProps) {
  const t = useTranslations("chat");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || isModerating) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  if (!activeUser) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-border/70 bg-muted/20",
        className
      )}>
        <div className="text-center space-y-4 p-8 max-w-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mx-auto">
            <MessageSquareText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground/80">
              {t("yourMessages")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("chooseConversation")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground/60 bg-muted/40 rounded-lg px-3 py-2">
            {t("pressEsc", { defaultValue: "Press Esc to clear selection" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col overflow-hidden relative h-full bg-background",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-card/95 backdrop-blur-sm z-10 shrink-0 h-[68px]">
        <Link 
          href={`/${activeUser.slug}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group min-w-0"
        >
          <Avatar className="h-10 w-10 border border-border group-hover:border-brand-primary/50 transition-colors">
            <AvatarImage src={activeUser.profile?.avatar || ""} className="object-cover" />
            <AvatarFallback>
              <UserIcon className="w-5 h-5 opacity-50" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-brand-primary transition-colors">
              {activeUser.profile?.full_name || activeUser.email?.split("@")[0]}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              @{activeUser.profile?.username || activeUser.slug || "user"}
            </p>
          </div>
        </Link>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Moderation Alert Banner */}
      {moderationAlert && (
        <div className="px-4 py-3 bg-linear-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-b border-red-200/50 dark:border-red-800/30 animate-in slide-in-from-top-2 duration-300 shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {t("moderationAlertTitle", { defaultValue: "Pesan Tidak Dapat Dikirim" })}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5 leading-relaxed">
                {moderationAlert || t("moderationAlertDefault", { defaultValue: "Pesan Anda mengandung konten yang melanggar pedoman komunitas." })}
              </p>
            </div>
            {onDismissAlert && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismissAlert}
                className="h-6 w-6 shrink-0 text-red-500/60 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4 bg-[url('/chat-pattern.png')] bg-repeat bg-fixed dark:bg-none dark:bg-muted/5">
        {loading ? (
          <div className="p-6">
            <DataLoading variant="card" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full py-10 opacity-70">
                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                   <MessageSquareText className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <p className="text-sm font-medium">{t("noMessagesYet")}</p>
                 <p className="text-xs text-muted-foreground">{t("sendToStart")}</p>
               </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex max-w-[80%] ${
                    msg.is_sender ? "self-end" : "self-start"
                  }`}
                >
                  {msg.is_flagged ? (
                    <div className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm flex flex-col bg-red-50/80 dark:bg-red-950/20 border border-red-200/60 dark:border-red-800/30 rounded-br-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600/80 dark:text-red-400/80 italic wrap-break-word">
                          {msg.message}
                        </span>
                      </div>
                      <span className="text-[9px] self-end mt-1 font-medium text-red-400/60">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm flex flex-col ${
                        msg.is_sender
                          ? "bg-brand-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted/50 border border-border/50 text-card-foreground rounded-bl-sm"
                      }`}
                    >
                      <span className="wrap-break-word">{msg.message}</span>
                      <span
                        className={`text-[9px] self-end mt-1 font-medium ${
                          msg.is_sender
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card/95 backdrop-blur-sm z-10 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-center bg-muted/30 p-1.5 rounded-full border border-border/60 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all shadow-xs"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("typeMessage")}
            className="flex-1 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-10 shadow-none text-sm"
            disabled={loading || isModerating}
          />
          <Button
            type="submit"
            size="icon"
            className={`rounded-full shrink-0 transition-all duration-300 w-10 h-10 ${
              isModerating
                ? "bg-amber-500/80 text-white animate-pulse"
                : newMessage.trim()
                  ? "bg-brand-primary text-white shadow-md hover:scale-105 hover:bg-brand-primary/90"
                  : "bg-muted text-muted-foreground"
            }`}
            disabled={!newMessage.trim() || loading || isModerating}
          >
            {isModerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
