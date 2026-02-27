import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuranState {
  lastRead: { surah: number; ayah: number } | null;
  viewMode: "surah" | "juz" | "page";
  setLastRead: (surah: number, ayah: number) => void;
  setViewMode: (mode: "surah" | "juz" | "page") => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      lastRead: null,
      viewMode: "surah",
      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah } }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    { name: "mashaf-quran" }
  )
);
