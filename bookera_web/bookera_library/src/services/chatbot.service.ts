import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIChatResponse {
  response: string;
}

export const chatbotService = {
  sendMessage: (message: string) =>
    api.post<ApiResponse<AIChatResponse>>("/ai/chat", { message }),

  getHistory: () =>
    api.get<ApiResponse<{ history: any[] }>>("/ai/history"),

  clearHistory: () =>
    api.delete<ApiResponse<null>>("/ai/history"),
};
