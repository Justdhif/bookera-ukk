"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { Send, X, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { chatbotService, ChatMessage } from "@/services/chatbot.service";
import { useAuthStore } from "@/store/auth.store";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ChatbotTrigger } from "@/components/custom-ui/ChatbotTrigger";
import DataLoading from "@/components/custom-ui/DataLoading";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md overflow-hidden p-1">
        <Image src={boteraLogo} alt="Botera" className="w-full h-full object-contain" />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-muted border border-border/50">
        <div className="flex items-center gap-1.5 h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-end gap-2 animate-fade-in max-w-full", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md overflow-hidden p-1">
          <Image src={boteraLogo} alt="Botera" className="w-full h-full object-contain" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-linear-to-br from-brand-primary to-brand-primary-dark text-white rounded-br-sm shadow-md shadow-brand-primary/20"
            : "bg-muted border border-border/50 text-foreground rounded-bl-sm",
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap wrap-break-word">{message.content}</span>
        ) : (
          <div className="text-sm leading-relaxed wrap-break-word [&>p]:my-1 [&>ul]:my-1 [&>ul]:pl-4 [&>li]:my-0.5">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-brand-primary">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="my-1 pl-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 pl-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                h1: ({ children }) => <h1 className="font-bold text-base my-1">{children}</h1>,
                h2: ({ children }) => <h2 className="font-semibold my-1">{children}</h2>,
                h3: ({ children }) => <h3 className="font-semibold my-1">{children}</h3>,
                code: ({ children }) => <code className="bg-background/60 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-primary pl-3 my-1 text-muted-foreground italic">{children}</blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className={cn("text-[10px] mt-1 select-none", isUser ? "text-white/60 text-right" : "text-muted-foreground")}>
          {message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  "📚 Buku paling banyak dipinjam?",
  "📊 Statistik perpustakaan",
  "💰 Info denda keterlambatan",
  "📋 Cara meminjam buku",
];

export function ChatbotWidget() {
  const t = useTranslations("chatbot");
  const { isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await chatbotService.getHistory();
      const historyData = res.data.data.history;
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: t("welcome"),
        timestamp: new Date(),
      };
      if (historyData.length > 0) {
        const mapped: ChatMessage[] = historyData.flatMap((chat: any) => [
          { id: `user-${chat.id}`, role: "user" as const, content: chat.message, timestamp: new Date(chat.created_at) },
          { id: `ai-${chat.id}`, role: "assistant" as const, content: chat.response, timestamp: new Date(chat.created_at) },
        ]);
        setMessages([welcomeMsg, ...mapped]);
      } else {
        setMessages([welcomeMsg]);
      }
    } catch (e) {
      console.error("Failed to fetch chatbot history:", e);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated, fetchHistory]);

  const sendMessage = async (text: string) => {
    const msgText = text.trim();
    if (!msgText || isLoading) return;

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", content: msgText, timestamp: new Date() }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatbotService.sendMessage(msgText);
      const aiReply = res.data.data.response;
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: aiReply, timestamp: new Date() }]);
      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: t("error"), timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      await chatbotService.clearHistory();
      setMessages([{ id: "welcome-" + Date.now(), role: "assistant", content: t("welcome"), timestamp: new Date() }]);
    } catch (e) {
      console.error("Failed to clear history:", e);
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <ChatbotTrigger
        isOpen={isOpen}
        hasUnread={hasUnread}
        onOpen={() => setIsOpen(true)}
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="p-0 flex flex-col w-full sm:max-w-[480px] gap-0 overflow-hidden"
        >
          <SheetTitle className="sr-only">{t("title")}</SheetTitle>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-linear-to-r from-brand-primary/5 to-brand-primary-dark/5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md shrink-0 overflow-hidden p-1">
              <Image src={boteraLogo} alt="Botera" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate">{t("title")}</span>
                <Sparkles className="w-3 h-3 text-brand-primary shrink-0" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-muted-foreground">{t("subtitle")}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0 relative">
            {isResetting ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/50 backdrop-blur-[2px] animate-fade-in">
                <DataLoading variant="card" size="md" className="border-none bg-transparent shadow-none" />
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/60 transition-all font-medium whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 pb-3 pt-2 border-t border-border/50 shrink-0">
            <div className="flex items-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                disabled={isLoading || isResetting}
                className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl self-end"
                title={t("resetTitle")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex-1 flex items-end gap-2 bg-muted/50 border border-border/60 rounded-xl px-3 py-2 focus-within:border-brand-primary/60 focus-within:bg-background transition-all">
                <Textarea
                  ref={inputRef}
                  id="chatbot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("inputPlaceholder")}
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent resize-none border-none focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground disabled:opacity-50 leading-relaxed min-h-[40px] py-2 overflow-y-hidden"
                  style={{ scrollbarWidth: "none", height: "40px" }}
                />

                <Button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  id="chatbot-send-btn"
                  size="icon"
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-lg transition-all self-end",
                    input.trim() && !isLoading
                      ? "bg-linear-to-br from-brand-primary to-brand-primary-dark text-white shadow-md hover:shadow-brand-primary/30 hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">{t("enterToSubmit")}</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
