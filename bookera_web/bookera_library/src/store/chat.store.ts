import { create } from "zustand";
import { User } from "@/types/user";

interface ChatState {
  isOpen: boolean;
  activeUser: User | null;
  setIsOpen: (isOpen: boolean) => void;
  setActiveUser: (user: User | null) => void;
  openChat: (user: User) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeUser: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveUser: (activeUser) => set({ activeUser }),
  openChat: (user) => set({ activeUser: user, isOpen: true }),
}));
