"use client";

import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "@/store/chat.store";
import { chatService, Message } from "@/services/chat.service";
import { chatbotService } from "@/services/chatbot.service";
import { useAuthStore } from "@/store/auth.store";
import { echo } from "@/lib/echo";
import { useTranslations } from "next-intl";
import ChatDetailSheet from "./ChatDetailSheet";
import { encryptMessage, decryptMessage } from "@/lib/crypto";

export default function GlobalChatSheet() {
  const t = useTranslations("chat");
  const { user } = useAuthStore();
  const { isOpen, setIsOpen, activeUser, setActiveUser } = useChatStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

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
    if (isOpen && activeUser?.slug) {
      fetchMessages(activeUser.slug);
    }
  }, [isOpen, activeUser?.slug]);

  const fetchMessages = async (slug: string, silent = false) => {
    try {
      if (!silent) setIsMessagesLoading(true);
      const data = await chatService.getMessages(slug);
      setMessages(data.messages);
      chatService.markAsRead(slug);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      if (!silent) setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (user && echo && isOpen && activeUser) {
      const channel = echo?.private(`chat.${user.id}`);
      channel?.listen(".message.sent", (e: any) => {
        const incomingMessage = e.message;

        if (
          incomingMessage.sender_id === activeUser.id
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
          chatService.markAsRead(activeUser.slug!);
        }
      });

      return () => {
        channel?.stopListening(".message.sent");
        echo?.leave(`chat.${user.id}`);
      };
    }
  }, [user?.id, activeUser?.id, isOpen]);

  const handleSendMessage = async (messageText: string, imageFiles?: File[]) => {
    if (!activeUser || !activeUser.slug || !user) return;

    if (!messageText.trim() && (!imageFiles || imageFiles.length === 0)) return;

    const encryptedText = messageText.trim() 
      ? encryptMessage(messageText.trim(), user.id, activeUser.id) 
      : "";

    const optimisticId = Date.now();

    const optimisticImagePaths = imageFiles && imageFiles.length > 0 
      ? imageFiles.map(file => URL.createObjectURL(file))
      : undefined;

    const optimisticMessage: Message = {
      id: optimisticId,
      message: encryptedText,
      image_path: optimisticImagePaths,
      is_read: false,
      created_at: new Date().toISOString(),
      is_sender: true,
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      setIsModerating(true);
      
      const formData = new FormData();
      if (messageText.trim()) {
        formData.append("message", encryptedText);
      }

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images[]", file);
        });
      }

      await chatService.sendMessage(activeUser.slug, formData);
      fetchMessages(activeUser.slug, true);
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

    // AI Intervention logic
    if (messageText.includes("@boteraAI")) {
      try {
        const aiResponse = await chatbotService.sendMessage(messageText.replace("@boteraAI", "").trim());
        const aiMessage = aiResponse.data.data.response;
        
        // Add AI response as an opponent message
        const aiOptimisticId = Date.now() + 1;
        const encryptedAI = encryptMessage(aiMessage, activeUser.id, user.id);

        setMessages((prev) => [
          ...prev,
          {
            id: aiOptimisticId,
            message: encryptedAI,
            is_read: true,
            created_at: new Date().toISOString(),
            is_sender: false,
            is_ai: true,
          },
        ]);
      } catch (error) {
        console.error("AI intervention failed", error);
      }
    }
  };

  if (!user) return null;

  return (
    <ChatDetailSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      activeUser={activeUser}
      messages={messages}
      loading={isMessagesLoading}
      onSendMessage={handleSendMessage}
      moderationAlert={moderationAlert}
      onDismissAlert={dismissModerationAlert}
      isModerating={isModerating}
    />
  );
}
