"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BorrowState {
  selectedBookIds: number[];
  setSelectedBookIds: (ids: number[]) => void;
  addBookId: (id: number) => void;
  removeBookId: (id: number) => void;
  clearSelectedBooks: () => void;
}

export const useBorrowStore = create<BorrowState>()(
  persist(
    (set) => ({
      selectedBookIds: [],
      setSelectedBookIds: (ids) => set({ selectedBookIds: Array.from(new Set(ids)) }),
      addBookId: (id) => set((state) => ({ 
        selectedBookIds: Array.from(new Set([...state.selectedBookIds, id])) 
      })),
      removeBookId: (id) => set((state) => ({ 
        selectedBookIds: state.selectedBookIds.filter((bookId) => bookId !== id) 
      })),
      clearSelectedBooks: () => set({ selectedBookIds: [] }),
    }),
    {
      name: "bookera-borrow-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
