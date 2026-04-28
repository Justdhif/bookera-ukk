import { create } from "zustand";

interface ChatbotState {
  isOpen: boolean;
  hasUnread: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setHasUnread: (hasUnread: boolean) => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  hasUnread: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  setHasUnread: (hasUnread) => set({ hasUnread }),
}));
