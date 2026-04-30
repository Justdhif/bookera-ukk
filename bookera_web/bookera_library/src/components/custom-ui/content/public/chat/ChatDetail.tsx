"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { User } from "@/types/user";
import { Message } from "@/services/chat.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Send,
  MessageSquareText,
  X,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  ImagePlus,
  Settings,
  Trash2,
  Lock,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import boteraLogo from "@/assets/logo/botera.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import DataLoading from "@/components/custom-ui/DataLoading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ImagePreviewDialog from "@/components/custom-ui/ImagePreviewDialog";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { chatService } from "@/services/chat.service";
import { decryptMessage } from "@/lib/crypto";
import { useAuthStore } from "@/store/auth.store";
import { WallpaperPattern } from "@/components/custom-ui/WallpaperPattern";
import AdminBadge from "@/components/custom-ui/badge/AdminBadge";
import CroissantBadge from "@/components/custom-ui/badge/CroissantBadge";
import MemberBadge from "@/components/custom-ui/badge/MemberBadge";

interface ChatDetailProps {
  activeUser: User | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (message: string, images?: File[]) => void;
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
  const { user: currentUser } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearSelectedImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Detect @ for mentions
    const lastChar = value[value.length - 1];
    const words = value.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      setMentionFilter(lastWord.slice(1).toLowerCase());
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (mention: string) => {
    const words = newMessage.split(" ");
    words[words.length - 1] = mention + " ";
    setNewMessage(words.join(" "));
    setShowMentionSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (!newMessage.trim() && selectedFiles.length === 0) ||
      !activeUser ||
      isModerating
    )
      return;
    onSendMessage(newMessage, selectedFiles);
    setNewMessage("");
    clearSelectedImages();
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t("today");
    if (date.toDateString() === yesterday.toDateString()) return t("yesterday");
    return date.toLocaleDateString();
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toDateString();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  if (!activeUser) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full rounded-xl border border-dashed border-border/70 bg-muted/20",
          className,
        )}
      >
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
            {t("pressEsc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden relative h-full bg-background",
        className,
      )}
    >
      <div className="p-4 flex items-center justify-between bg-card/95 backdrop-blur-sm z-10 shrink-0 h-[68px]">
        <Link
          href={`/${activeUser.slug}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group min-w-0"
        >
          <Avatar className="h-10 w-10 border border-border group-hover:border-brand-primary/50 transition-colors">
            <AvatarImage
              src={activeUser.profile?.avatar || ""}
              className="object-cover"
            />
            <AvatarFallback>
              <UserIcon className="w-5 h-5 opacity-50" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-brand-primary transition-colors">
                {activeUser.profile?.full_name ||
                  activeUser.email?.split("@")[0]}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {activeUser.role === "admin" && (
                  <AdminBadge />
                )}
                {activeUser.role === "member" && (
                  <MemberBadge />
                )}
                {activeUser.profile?.gender === "croissant" && (
                  <CroissantBadge />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              @
              {activeUser.profile?.username ||
                activeUser.slug ||
                t("userFallback")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
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
      </div>

      {moderationAlert && (
        <div className="px-4 py-3 bg-linear-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-b border-red-200/50 dark:border-red-800/30 animate-in slide-in-from-top-2 duration-300 shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {t("moderationAlertTitle")}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5 leading-relaxed">
                {moderationAlert || t("moderationAlertDefault")}
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

      <div className="flex-1 overflow-hidden relative">
        <WallpaperPattern />
        <ScrollArea className="h-full relative z-10">
          <div className="flex flex-col gap-4 p-4 min-h-full">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <DataLoading variant="inline" size="lg" />
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-0">
                  <div className="bg-amber-100 dark:bg-[#1a1608] border border-amber-200 dark:border-amber-900 px-6 py-2 rounded-xl max-w-sm shadow-md">
                    <div className="flex items-start gap-2">
                      <Lock className="h-3 w-3 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-amber-900 dark:text-amber-400 leading-relaxed text-center font-medium">
                        {t("encryptionNotice")}
                      </p>
                    </div>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center py-4">
                      <div className="px-5 py-1.5 bg-brand-primary/10 dark:bg-brand-primary/20 backdrop-blur-xl rounded-full text-[9px] font-black text-brand-primary dark:text-brand-primary-light uppercase tracking-[0.2em] border border-brand-primary/20 dark:border-brand-primary/30 shadow-xs ring-1 ring-brand-primary/10">
                        {t("today")}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 opacity-70">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                        <MessageSquareText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">
                        {t("noMessagesYet")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("sendToStart")}
                      </p>
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date} className="flex flex-col space-y-4">
                      <div className="flex justify-center my-4 sticky top-5 z-20">
                        <span className="bg-brand-primary/10 dark:bg-brand-primary/20 backdrop-blur-xl px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary dark:text-brand-primary-light border border-brand-primary/20 dark:border-brand-primary/30 shadow-xs ring-1 ring-brand-primary/10">
                          {formatMessageDate(group.messages[0].created_at)}
                        </span>
                      </div>

                      {group.messages.map((msg, i) => {
                        const decryptedText =
                          msg.message && currentUser && activeUser
                            ? decryptMessage(
                                msg.message,
                                currentUser.id,
                                activeUser.id,
                              )
                            : msg.message;

                        return (
                          <div
                            key={msg.id || i}
                            className={cn(
                              "flex w-full mb-3 last:mb-0 gap-3 items-end",
                              msg.is_sender && !msg.is_ai
                                ? "self-end flex-row-reverse text-right"
                                : "self-start flex-row text-left",
                            )}
                          >
                            {!msg.is_sender && (
                              <div className="flex flex-col items-center mb-1 shrink-0">
                                <Avatar
                                  className={cn(
                                    "h-8 w-8 border",
                                    msg.is_ai
                                      ? "border-brand-primary/50 shadow-sm"
                                      : "border-border",
                                  )}
                                >
                                  {msg.is_ai ? (
                                    <div className="w-full h-full bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center p-1">
                                      <Image
                                        src={boteraLogo}
                                        alt="Botera"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <AvatarImage
                                        src={activeUser.profile?.avatar || ""}
                                        className="object-cover"
                                      />
                                      <AvatarFallback>
                                        <UserIcon className="h-4 w-4 opacity-50" />
                                      </AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                              </div>
                            )}

                            {msg.is_flagged ? (
                              <div className="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-md flex flex-col bg-[#fff5f5] dark:bg-[#2a1a1a] border border-red-200 dark:border-red-900/50 rounded-br-sm">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                  <span className="text-red-600/80 dark:text-red-400/80 italic wrap-break-word">
                                    {decryptedText}
                                  </span>
                                </div>
                                <span className="text-[9px] self-end mt-1 font-medium text-red-400/60">
                                  {new Date(msg.created_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "rounded-2xl text-[14px] leading-relaxed shadow-sm flex flex-col overflow-hidden relative",
                                  msg.image_path ? "p-1" : "px-4 py-2.5",
                                  msg.is_sender
                                    ? "bg-brand-primary text-white rounded-br-sm"
                                    : "bg-[#f8f9fa] dark:bg-[#2a2d31] border border-border/50 dark:border-white/10 text-card-foreground rounded-bl-sm shadow-sm",
                                )}
                              >
                                {msg.is_ai && !msg.image_path && (
                                  <div className="absolute top-0 right-0 p-1.5">
                                    <Badge className="bg-brand-primary text-[8px] font-black text-white uppercase tracking-tighter shadow-sm border border-white/10">
                                      AI
                                    </Badge>
                                  </div>
                                )}
                                {msg.image_path && (
                                  <div
                                    className={cn(
                                      "flex flex-wrap gap-2 mb-1",
                                      Array.isArray(msg.image_path) &&
                                        msg.image_path.length > 1
                                        ? "grid grid-cols-2"
                                        : "flex",
                                    )}
                                  >
                                    {Array.isArray(msg.image_path) ? (
                                      msg.image_path.map((path, idx) => {
                                        const fullPath = path;
                                        const isSentByMe =
                                          msg.is_sender && !msg.is_ai;

                                        return (
                                          <Button
                                            key={idx}
                                            variant="ghost"
                                            onClick={() => {
                                              setSelectedImage(fullPath);
                                              setIsPreviewOpen(true);
                                            }}
                                            className="relative group/img overflow-hidden rounded-xl border border-border/20 transition-transform hover:scale-[1.02] active:scale-95 h-auto p-0"
                                          >
                                            <img
                                              key={idx}
                                              src={fullPath}
                                              alt={`attachment-${idx}`}
                                              className={cn(
                                                "object-cover",
                                                msg.image_path &&
                                                  Array.isArray(
                                                    msg.image_path,
                                                  ) &&
                                                  msg.image_path.length > 1
                                                  ? "h-32 w-full"
                                                  : "max-w-xs",
                                              )}
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                              <span className="text-white text-[11px] font-medium bg-black/40 px-3 py-1.5 rounded-full">
                                                {t("view")}
                                              </span>
                                            </div>
                                          </Button>
                                        );
                                      })
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        onClick={() => {
                                          const fullPath =
                                            msg.image_path!.toString();
                                          setSelectedImage(fullPath);
                                          setIsPreviewOpen(true);
                                        }}
                                        className="relative group/img overflow-hidden rounded-xl border border-border/20 transition-transform hover:scale-[1.02] active:scale-95 h-auto p-0"
                                      >
                                        <img
                                          src={msg.image_path!.toString()}
                                          alt="attachment"
                                          className="max-w-xs object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                          <span className="text-white text-[11px] font-medium bg-black/40 px-3 py-1.5 rounded-full">
                                            {t("view")}
                                          </span>
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    msg.image_path
                                      ? "px-2.5 pb-1 pt-0.5 flex flex-col"
                                      : "flex flex-col",
                                    msg.is_ai && "pr-6",
                                  )}
                                >
                                  <span className="wrap-break-word">
                                    {decryptedText
                                      ?.split(/(@boteraAI)/g)
                                      .map((part, index) =>
                                        part === "@boteraAI" ? (
                                          <span
                                            key={index}
                                            className={cn(
                                              "font-bold mx-0.5",
                                              msg.is_sender
                                                ? "text-white underline decoration-white/30"
                                                : "text-brand-primary",
                                            )}
                                          >
                                            {part}
                                          </span>
                                        ) : (
                                          part
                                        ),
                                      )}
                                  </span>
                                  <div className="flex items-center gap-1 self-end mt-1">
                                    <span
                                      className={cn(
                                        "text-[9px] font-medium",
                                        msg.is_sender && !msg.is_ai
                                          ? "text-white/70"
                                          : "text-muted-foreground",
                                      )}
                                    >
                                      {new Date(
                                        msg.created_at,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {msg.is_sender && (
                                      <div className="text-white/70 flex items-center">
                                        {msg.status === "sending" ? (
                                          <Clock className="h-2.5 w-2.5 animate-pulse" />
                                        ) : msg.is_read ? (
                                          <CheckCheck className="h-3 w-3 text-sky-300" />
                                        ) : (
                                          <Check className="h-3 w-3" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} className="h-2" />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {imagePreviews.length > 0 && (
        <div className="px-4 py-2 bg-muted/10 border-t border-border/50 relative">
          <div className="flex gap-3 overflow-x-auto pt-2 pr-2 pb-2 scrollbar-hide">
            {imagePreviews.map((url, index) => (
              <div key={url} className="relative inline-block shrink-0">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="h-20 w-20 rounded-md border border-border shadow-sm object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full shadow-md"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-card/95 backdrop-blur-sm z-10 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-center bg-muted/30 p-1.5 rounded-full border border-border/60 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all shadow-xs"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full shrink-0 text-muted-foreground hover:text-foreground h-10 w-10"
          >
            <ImagePlus className="h-5 w-5" />
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </Button>
          <div className="flex-1 relative">
            <AnimatePresence>
              {showMentionSuggestions &&
                currentUser?.role === "member" &&
                "boteraAI".startsWith(mentionFilter) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 w-64 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
                  >
                    <div className="p-2 border-b border-border/50 bg-muted/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                        {t("mentionsSuggestions") || "Suggestions"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => insertMention("@boteraAI")}
                      className="w-full flex items-center gap-3 p-3 hover:bg-brand-primary/5 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center shadow-md shrink-0 overflow-hidden p-1">
                        <Image
                          src={boteraLogo}
                          alt="Botera"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold group-hover:text-brand-primary transition-colors">
                          BoteraAI
                        </span>
                        <span className="text-[11px] text-muted-foreground italic">
                          {t("aiMentionHint")}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )}
            </AnimatePresence>

            <Input
              value={newMessage}
              onChange={handleInputChange}
              placeholder={t("typeMessage")}
              className={cn(
                "flex-1 rounded-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-10 shadow-none text-sm transition-colors",
              )}
              disabled={loading || isModerating}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className={`rounded-full shrink-0 transition-all duration-300 w-10 h-10 ${
              isModerating
                ? "bg-amber-500/80 text-white animate-pulse"
                : newMessage.trim() || selectedFiles.length > 0
                  ? "bg-brand-primary text-white shadow-md hover:scale-105 hover:bg-brand-primary/90"
                  : "bg-muted text-muted-foreground"
            }`}
            disabled={
              (!newMessage.trim() && selectedFiles.length === 0) ||
              loading ||
              isModerating
            }
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <ImagePreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageUrl={selectedImage}
        alt="Chat Preview"
      />
    </div>
  );
}
