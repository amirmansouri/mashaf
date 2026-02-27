import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Bookmark {
  id: string;
  surah: number;
  ayah: number;
  note?: string;
  color?: string;
  createdAt: number;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (surah: number, ayah: number, note?: string, color?: string) => void;
  removeBookmark: (id: string) => void;
  updateNote: (id: string, note: string) => void;
  isBookmarked: (surah: number, ayah: number) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (surah, ayah, note, color) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              id: `${surah}-${ayah}-${Date.now()}`,
              surah,
              ayah,
              note,
              color,
              createdAt: Date.now(),
            },
          ],
        })),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),
      updateNote: (id, note) =>
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, note } : b
          ),
        })),
      isBookmarked: (surah, ayah) =>
        get().bookmarks.some((b) => b.surah === surah && b.ayah === ayah),
    }),
    { name: "mashaf-bookmarks" }
  )
);
