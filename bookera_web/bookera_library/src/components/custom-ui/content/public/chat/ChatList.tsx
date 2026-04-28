"use client";

import { useState } from "react";
import { User } from "@/types/user";
import { Conversation } from "@/services/chat.service";
import { Input } from "@/components/ui/input";
import { Search, Filter, MessageSquareText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DataLoading from "@/components/custom-ui/DataLoading";
import EmptyState from "@/components/custom-ui/EmptyState";
import { User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ChatListProps {
  conversations: Conversation[];
  followedUsers: User[];
  activeUser: User | null;
  loading: boolean;
  onSelectUser: (user: User) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  searchValue: string;
  statusValue: string;
}

export default function ChatList({
  conversations,
  followedUsers,
  activeUser,
  loading,
  onSelectUser,
  onSearchChange,
  onStatusChange,
  searchValue,
  statusValue,
}: ChatListProps) {
  const t = useTranslations("chat");

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleStatusClick = (status: string) => {
    onStatusChange(status);
  };

  const statusOptions = [
    { value: "all", label: t("all") },
    { value: "unread", label: t("unread") },
    { value: "read", label: t("read") },
  ];

  const unreadCount = conversations.reduce(
    (acc, conv) => acc + (conv.unread_count > 0 ? 1 : 0),
    0
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquareText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">
                {t("messagesTitle")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {conversations.length} {t("conversationsCount", { defaultValue: "Conversations" })}
                {unreadCount > 0 && (
                  <span className="ml-1 font-medium text-primary">
                    · {unreadCount} {t("unread")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("searchMessages")}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-8 text-sm bg-muted/40 border-border/60 focus:bg-background"
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5">
            {statusOptions.map((option) => {
              const isActive = statusValue === option.value;
              return (
                <Button
                  key={option.value}
                  onClick={() => handleStatusClick(option.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 h-7",
                    isActive
                      ? "bg-brand-primary text-white shadow-sm hover:bg-brand-primary/90"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {option.label}
                  {option.value === "unread" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "ml-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-4 h-4 px-1",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/15 text-primary",
                      )}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {followedUsers.length > 0 && !searchValue && (
          <div className="p-3.5 border-b border-border/50 bg-muted/10">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
              {t("following")}
            </p>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-3 px-1 py-1">
                {followedUsers.map((followedUser) => (
                  <button
                    key={followedUser.id}
                    onClick={() => onSelectUser(followedUser)}
                    className="flex flex-col items-center gap-1.5 focus:outline-none group"
                  >
                    <div
                      className={cn(
                        "p-0.5 rounded-full ring-2 transition-all",
                        activeUser?.id === followedUser.id
                          ? "ring-brand-primary"
                          : "ring-transparent group-hover:ring-brand-primary/30"
                      )}
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={followedUser.profile?.avatar || ""} className="object-cover" />
                        <AvatarFallback>
                          <UserIcon className="w-4 h-4 opacity-50" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-[10px] w-12 truncate text-center font-medium group-hover:text-brand-primary transition-colors">
                      {followedUser.profile?.full_name?.split(" ")[0] ||
                        followedUser.email?.split("@")[0]}
                    </span>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-1" />
            </ScrollArea>
          </div>
        )}

        {loading ? (
          <div className="flex h-full items-center justify-center p-3">
            <DataLoading variant="inline" size="lg" />
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText />}
            title={t("noConversations")}
            description={
              searchValue
                ? t("noMatchingMessages")
                : t("selectSomeoneToChat")
            }
            className="h-full border-0"
          />
        ) : (
          <div className="divide-y divide-border/50">
            {conversations.map((conv) => {
              const isSelected = activeUser?.id === conv.user.id;
              const hasUnread = conv.unread_count > 0;
              return (
                <button
                  key={conv.user.id}
                  onClick={() => onSelectUser(conv.user)}
                  className={cn(
                    "w-full relative flex gap-3 p-3.5 cursor-pointer transition-all duration-150 group text-left",
                    isSelected
                      ? "bg-primary/8 dark:bg-primary/12"
                      : hasUnread
                        ? "bg-blue-50/40 dark:bg-blue-950/10 hover:bg-muted/60"
                        : "hover:bg-muted/50",
                    isSelected && "border-l-[3px] border-l-brand-primary pl-2.75",
                  )}
                >
                  <Avatar className="h-10 w-10 border border-border/50 shrink-0">
                    <AvatarImage src={conv.user.profile?.avatar || ""} className="object-cover" />
                    <AvatarFallback>
                      <UserIcon className="w-5 h-5 opacity-50" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4
                        className={cn(
                          "text-sm truncate leading-snug",
                          hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                        )}
                      >
                        {conv.user.profile?.full_name ||
                          conv.user.email?.split("@")[0]}
                      </h4>
                      <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap ml-2">
                        {new Date(conv.last_message.created_at).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate leading-relaxed",
                        hasUnread
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {conv.last_message.is_sender && <span className="opacity-70 mr-1">{t("you")}:</span>}
                      {conv.last_message.message}
                    </p>
                  </div>
                  {hasUnread && (
                    <div className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/30" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
