"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/types/user";
import { chatService, Conversation, Message } from "@/services/chat.service";
import { useAuthStore } from "@/store/auth.store";
import { echo } from "@/lib/echo";
import { followService } from "@/services/follow.service";
import { useTranslations } from "next-intl";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";


import ChatDetailSheet from "./ChatDetailSheet";

export default function ChatClient() {
  const t = useTranslations("chat");
  const { user } = useAuthStore();
  const [isMobile, setIsMobileState] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobileState(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobileState(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  const searchParams = useSearchParams();
  const initialUserSlug = searchParams.get("user");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Moderation state
  const [moderationAlert, setModerationAlert] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);

  const dismissModerationAlert = useCallback(() => {
    setModerationAlert(null);
  }, []);

  // Auto-dismiss moderation alert after 6 seconds
  useEffect(() => {
    if (moderationAlert) {
      const timer = setTimeout(() => setModerationAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [moderationAlert]);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchFollowedUsers();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && initialUserSlug) {
      fetchMessagesAndSetUser(initialUserSlug);
      if (isMobile) setIsDetailOpen(true);
    }
  }, [user?.id, initialUserSlug]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveUser(null);
        setIsDetailOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setIsConversationsLoading(true);
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      if (!silent) setIsConversationsLoading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    if (!user?.slug) return;
    try {
      const { data } = await followService.getUserFollowing(user.slug, {
        per_page: 50,
      });
      const users = data.data.data
        .map((record: any) => record.followable)
        .filter((u: any): u is User => !!u);
      setFollowedUsers(users);
    } catch (error) {
      console.error("Failed to fetch followed users", error);
    }
  };

  const fetchMessagesAndSetUser = async (slug: string) => {
    try {
      setIsMessagesLoading(true);
      const data = await chatService.getMessages(slug);
      setActiveUser(data.user);
      setMessages(data.messages);
      chatService.markAsRead(slug).then(() => fetchConversations(true));
    } catch (error) {
      console.error("Failed to fetch initial messages", error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleSelectUser = (selectedUser: User) => {
    if (isMobile) {
      setIsDetailOpen(true);
    }

    if (selectedUser.slug !== activeUser?.slug) {
      setActiveUser(selectedUser);
      setModerationAlert(null);
      if (selectedUser.slug) {
        fetchMessagesAndSetUser(selectedUser.slug);
      }
    }
  };

  useEffect(() => {
    if (user && echo) {
      const channel = echo?.private(`chat.${user.id}`);
      channel?.listen(".message.sent", (e: any) => {
        const incomingMessage = e.message;

        if (
          activeUser &&
          incomingMessage.sender_id === activeUser.id &&
          activeUser.slug
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: incomingMessage.id,
              message: incomingMessage.message,
              is_read: incomingMessage.is_read,
              created_at: incomingMessage.created_at,
              is_sender: false,
            },
          ]);
          chatService
            .markAsRead(activeUser.slug)
            .then(() => fetchConversations(true));
        } else {
          fetchConversations(true);
        }
      });

      return () => {
        channel?.stopListening(".message.sent");
        echo?.leave(`chat.${user.id}`);
      };
    }
  }, [user?.id, activeUser?.id]);

  const handleSendMessage = async (messageText: string) => {
    if (!activeUser || !activeUser.slug) return;

    const optimisticId = Date.now();

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        message: messageText,
        is_read: false,
        created_at: new Date().toISOString(),
        is_sender: true,
      },
    ]);

    try {
      setIsModerating(true);
      await chatService.sendMessage(activeUser.slug, messageText);
      fetchConversations(true);
    } catch (error: any) {
      // Check if it's a moderation rejection (422 with flagged: true)
      if (error?.response?.status === 422 && error?.response?.data?.flagged) {
        const reason = error.response.data.reason || "";
        setModerationAlert(reason);

        // Replace the optimistic message with a flagged fallback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? { ...msg, message: t("flaggedMessageFallback", { defaultValue: "⚠️ Message removed for violating community guidelines." }), is_flagged: true }
              : msg
          )
        );

      } else {
        console.error("Failed to send message", error);
        // Remove the optimistic message on other errors
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      }
    } finally {
      setIsModerating(false);
    }
  };

  if (!user) {
    return null;
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      searchQuery === "" ||
      conv.user.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && conv.unread_count > 0) ||
      (statusFilter === "read" && conv.unread_count === 0);
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="col-span-1 lg:col-span-5">
          <ChatList
            conversations={filteredConversations}
            followedUsers={followedUsers}
            activeUser={activeUser}
            loading={isConversationsLoading}
            onSelectUser={handleSelectUser}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            searchValue={searchQuery}
            statusValue={statusFilter}
          />
        </div>
        <div className="hidden lg:block lg:col-span-7">
          <ChatDetail
            activeUser={activeUser}
            messages={messages}
            loading={isMessagesLoading}
            onSendMessage={handleSendMessage}
            onClose={() => setActiveUser(null)}
            className="h-[calc(100vh-8rem)] rounded-xl border border-border bg-card shadow-sm"
            moderationAlert={moderationAlert}
            onDismissAlert={dismissModerationAlert}
            isModerating={isModerating}
          />
        </div>
      </div>

      {/* Mobile Chat Detail Sheet */}
      {isMobile && (
        <ChatDetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          activeUser={activeUser}
          messages={messages}
          loading={isMessagesLoading}
          onSendMessage={handleSendMessage}
          moderationAlert={moderationAlert}
          onDismissAlert={dismissModerationAlert}
          isModerating={isModerating}
        />
      )}
    </div>
  );
}


