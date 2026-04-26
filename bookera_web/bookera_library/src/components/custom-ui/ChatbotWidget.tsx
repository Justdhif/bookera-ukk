"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import {
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { chatbotService, ChatMessage } from "@/services/chatbot.service";
import { useAuthStore } from "@/store/auth.store";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md overflow-hidden p-1">
        <Image
          src={boteraLogo}
          alt="Botera"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-muted border border-border/50">
        <div className="flex items-center gap-1.5 h-4">
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row",
        "max-w-full",
      )}
    >
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md overflow-hidden p-1">
          <Image
            src={boteraLogo}
            alt="Botera"
            className="w-full h-full object-contain"
          />
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
          <span className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </span>
        ) : (
          <div className="text-sm leading-relaxed wrap-break-word [&>p]:my-1 [&>ul]:my-1 [&>ul]:pl-4 [&>li]:my-0.5 [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="my-1 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-brand-primary">
                    {children}
                  </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => (
                  <ul className="my-1 pl-4 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-1 pl-4 list-decimal">{children}</ol>
                ),
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="font-bold text-base my-1">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-semibold my-1">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-semibold my-1">{children}</h3>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-primary pl-3 my-1 text-muted-foreground italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div
          className={cn(
            "text-[10px] mt-1 select-none",
            isUser ? "text-white/60 text-right" : "text-muted-foreground",
          )}
        >
          {message.timestamp.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

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
        const mappedMessages: ChatMessage[] = historyData.flatMap((chat: any) => [
          {
            id: `user-${chat.id}`,
            role: "user" as const,
            content: chat.message,
            timestamp: new Date(chat.created_at),
          },
          {
            id: `ai-${chat.id}`,
            role: "assistant" as const,
            content: chat.response,
            timestamp: new Date(chat.created_at),
          },
        ]);
        setMessages([welcomeMsg, ...mappedMessages]);
      } else {
        setMessages([welcomeMsg]);
      }
    } catch (error) {
      console.error("Failed to fetch chatbot history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const msgText = text.trim();
    if (!msgText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: msgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await chatbotService.sendMessage(msgText);
      const aiReply = res.data.data.response;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: t("error"),
          timestamp: new Date(),
        },
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
      setIsLoading(true);
      setShowConfirmDelete(false);
      await chatbotService.clearHistory();
      setMessages([
        {
          id: "welcome-" + Date.now(),
          role: "assistant",
          content: t("welcome"),
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not logged in
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-9998 flex flex-col items-end gap-3">
        {/* Unread badge notification */}
        {hasUnread && !isOpen && (
          <Badge className="animate-fade-in bg-brand-primary text-white text-[11px] rounded-full px-3 py-1 shadow-lg shadow-brand-primary/30 font-medium">
            {t("unreadBadge")}
          </Badge>
        )}

        <button
          id="chatbot-toggle-btn"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle Botera AI"
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
            "bg-linear-to-br from-brand-primary to-brand-primary-dark",
            "hover:scale-110 hover:shadow-2xl hover:shadow-brand-primary/40",
            "focus:outline-none focus:ring-4 focus:ring-brand-primary/30",
            isOpen && "rotate-0 scale-95",
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-all" />
          ) : (
            <>
              <div className="w-8 h-8 overflow-hidden">
                <Image
                  src={boteraLogo}
                  alt="Botera"
                  className="w-full h-full object-contain"
                />
              </div>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-ping" />
              )}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div
          id="chatbot-panel"
          className={cn(
            "fixed z-9997 flex flex-col",
            "bg-background border border-border/70 rounded-2xl shadow-2xl",
            "transition-all duration-300 ease-out animate-fade-in",
            isExpanded
              ? "bottom-0 right-0 left-0 top-0 rounded-none sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[480px] sm:h-[700px] sm:rounded-2xl"
              : "bottom-24 right-6 w-[360px] h-[540px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-linear-to-r from-brand-primary/5 to-brand-primary-dark/5 rounded-t-2xl shrink-0">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md shrink-0 overflow-hidden p-1">
              <Image
                src={boteraLogo}
                alt="Botera"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate">
                  {t("title")}
                </span>
                <Sparkles className="w-3 h-3 text-brand-primary shrink-0" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  {t("subtitle")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmDelete(true)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{t("resetTooltip")}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded((v) => !v)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:flex"
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isExpanded ? t("minimizeTooltip") : t("maximizeTooltip")}
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{t("closeTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />

            {/* Custom Confirmation Dialog */}
            {showConfirmDelete && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-xs animate-fade-in">
                <div className="bg-background border border-border shadow-2xl rounded-2xl p-5 w-full max-w-[280px] text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t("resetTitle")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("resetDesc")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 text-xs h-9 rounded-xl"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReset}
                      className="flex-1 text-xs h-9 rounded-xl shadow-md shadow-destructive/20"
                    >
                      {t("confirmDelete")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts (only on first message) */}
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

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-border/50 shrink-0">
            <div className="flex items-end gap-2 bg-muted/50 border border-border/60 rounded-xl px-3 py-2 focus-within:border-brand-primary/60 focus-within:bg-background transition-all">
              <Textarea
                ref={inputRef}
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("inputPlaceholder")}
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent resize-none border-none focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground disabled:opacity-50 max-h-24 leading-relaxed min-h-[40px] py-2"
                style={{ scrollbarWidth: "none" }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                id="chatbot-send-btn"
                size="icon"
                className={cn(
                  "shrink-0 w-8 h-8 rounded-lg transition-all",
                  input.trim() && !isLoading
                    ? "bg-linear-to-br from-brand-primary to-brand-primary-dark text-white shadow-md hover:shadow-brand-primary/30 hover:scale-105"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              {t("enterToSubmit")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
