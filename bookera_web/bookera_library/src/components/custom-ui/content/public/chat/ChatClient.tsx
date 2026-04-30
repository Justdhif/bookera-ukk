"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/types/user";
import { chatService, Conversation, Message } from "@/services/chat.service";
import { chatbotService } from "@/services/chatbot.service";
import { useAuthStore } from "@/store/auth.store";
import { echo } from "@/lib/echo";
import { followService } from "@/services/follow.service";
import { useTranslations } from "next-intl";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";
import ChatDetailSheet from "./ChatDetailSheet";
import { encryptMessage, decryptMessage } from "@/lib/crypto";

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

  const [moderationAlert, setModerationAlert] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);

  const dismissModerationAlert = useCallback(() => {
    setModerationAlert(null);
  }, []);

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
              is_ai: incomingMessage.is_ai,
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

  const handleSendMessage = async (messageText: string, imageFiles?: File[]) => {
    if (!activeUser || !activeUser.slug || !user) return;

    if (!messageText.trim() && (!imageFiles || imageFiles.length === 0)) return;

    // Don't encrypt if it's an AI trigger to avoid server moderation false positives on ciphertext
    const encryptedText = (messageText.includes("@boteraAI") && user.role === 'member')
      ? messageText.trim()
      : (messageText.trim() ? encryptMessage(messageText.trim(), user.id, activeUser.id) : "");

    const optimisticId = Date.now();

    if (messageText.trim() && (!imageFiles || imageFiles.length === 0)) {
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          message: encryptedText,
          is_read: false,
          created_at: new Date().toISOString(),
          is_sender: true,
        },
      ]);
    }

    try {
      setIsModerating(true);

      // AI moderation check on raw text before encryption
      if (messageText.trim()) {
        const moderation = await chatService.moderateMessage(messageText.trim());
        if (moderation.is_inappropriate) {
          setModerationAlert(moderation.reason);
          setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
          return;
        }
      }

      if (imageFiles && imageFiles.length > 0) {
        const formData = new FormData();
        if (messageText.trim()) {
          formData.append("message", encryptedText);
          formData.append("is_encrypted", "1");
        }
        
        // Append all images to 'images[]'
        imageFiles.forEach((file) => {
          formData.append("images[]", file);
        });

        await chatService.sendMessage(activeUser.slug, formData);
        fetchConversations(true);
        fetchMessagesAndSetUser(activeUser.slug);
      } else {
        const formData = new FormData();
        formData.append("message", encryptedText);
        formData.append("is_encrypted", "1");
        await chatService.sendMessage(activeUser.slug, formData);
        fetchConversations(true);
      }
    } catch (error: any) {
      if (error?.response?.status === 422 && error?.response?.data?.flagged) {
        const reason = error.response.data.reason || "";
        setModerationAlert(reason);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? { ...msg, message: t("flaggedMessageFallback"), is_flagged: true }
              : msg
          )
        );

      } else {
        console.error("Failed to send message", error);
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
      }
    } finally {
      setIsModerating(false);
    }

    // AI Intervention logic - Only for members
    if (messageText.includes("@boteraAI") && user.role === 'member') {
      try {
        const aiResponse = await chatbotService.sendMessage(messageText.replace("@boteraAI", "").trim());
        const aiMessage = aiResponse.data.data.response;
        
        // SAVE AI MESSAGE TO DATABASE
        // We don't add it manually to setMessages anymore because Echo will broadcast it back to us 
        // since the sender is the opponent and receiver is us. This prevents duplication.
        try {
          const aiFormData = new FormData();
          aiFormData.append("message", aiMessage);
          aiFormData.append("is_ai", "1");
          aiFormData.append("is_encrypted", "0");
          await chatService.sendMessage(activeUser.slug, aiFormData);
          // Refresh conversations to show AI message in list
          fetchConversations(true);
        } catch (saveError) {
          console.error("Failed to save AI response to DB", saveError);
        }
      } catch (error) {
        console.error("AI intervention failed", error);
      }
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
            currentUser={user}
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


