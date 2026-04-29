import api from "@/lib/axios";
import { User } from "@/types/user";

export interface Message {
  id: number;
  message?: string;
  image_path?: string | string[];
  is_read: boolean;
  created_at: string;
  is_sender: boolean;
  is_flagged?: boolean;
  is_ai?: boolean;
  status?: "sending" | "sent" | "read";
}

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}

export interface ChatThread {
  user: User;
  messages: (Message & { sender?: User })[];
}

export interface ModerationResult {
  is_inappropriate: boolean;
  reason: string;
}

export const chatService = {
  getConversations: async () => {
    const { data } = await api.get<Conversation[]>("/chat/conversations");
    return data;
  },

  getMessages: async (userSlug: string) => {
    const { data } = await api.get<ChatThread>(`/chat/${userSlug}`);
    return data;
  },

  sendMessage: async (userSlug: string, formData: FormData) => {
    const { data } = await api.post(`/chat/${userSlug}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  moderateMessage: async (message: string): Promise<ModerationResult> => {
    const { data } = await api.post<ModerationResult>("/chat/moderate", { message });
    return data;
  },

  markAsRead: async (userSlug: string) => {
    const { data } = await api.patch(`/chat/${userSlug}/read`);
    return data;
  },
  
  deleteConversation: async (userSlug: string) => {
    const { data } = await api.delete(`/chat/${userSlug}`);
    return data;
  },

  clearMessages: async (userSlug: string) => {
    const { data } = await api.delete(`/chat/${userSlug}/clear`);
    return data;
  },
};

