import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LivreSavedPosition {
  page: number;
  surah: number;
  surahName: string;
  ayah: number;
  timestamp: number;
}

interface LivreState {
  currentPage: number;
  savedPosition: LivreSavedPosition | null;
  hizbLog: Record<number, number>;
  autoScrollSpeed: number;

  setCurrentPage: (page: number) => void;
  savePosition: (page: number, surah: number, surahName: string, ayah: number) => void;
  clearPosition: () => void;
  setHizbLog: (day: number, hizbs: number) => void;
  removeHizbLog: (day: number) => void;
  setAutoScrollSpeed: (speed: number) => void;
}

export const useLivreStore = create<LivreState>()(
  persist(
    (set) => ({
      currentPage: 1,
      savedPosition: null,
      hizbLog: {},
      autoScrollSpeed: 1,

      setCurrentPage: (page) => set({ currentPage: Math.max(1, Math.min(604, page)) }),
      savePosition: (page, surah, surahName, ayah) =>
        set({ savedPosition: { page, surah, surahName, ayah, timestamp: Date.now() } }),
      clearPosition: () => set({ savedPosition: null }),
      setHizbLog: (day, hizbs) =>
        set((state) => ({ hizbLog: { ...state.hizbLog, [day]: hizbs } })),
      removeHizbLog: (day) =>
        set((state) => {
          const { [day]: _, ...rest } = state.hizbLog;
          void _;
          return { hizbLog: rest };
        }),
      setAutoScrollSpeed: (speed) => set({ autoScrollSpeed: speed }),
    }),
    { name: "mashaf-livre" }
  )
);
