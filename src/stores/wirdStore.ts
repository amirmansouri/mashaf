import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WirdState {
  dailyPages: number;
  currentPage: number;
  lastSurah: number;
  lastAyah: number;
  streak: number;
  lastReadDate: string | null;
  setDailyPages: (pages: number) => void;
  updateProgress: (surah: number, ayah: number, page: number) => void;
  resetDaily: () => void;
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useWirdStore = create<WirdState>()(
  persist(
    (set, get) => ({
      dailyPages: 4, // ~2 pages = 1 Juz in 15 days
      currentPage: 1,
      lastSurah: 1,
      lastAyah: 1,
      streak: 0,
      lastReadDate: null,
      setDailyPages: (dailyPages) => set({ dailyPages }),
      updateProgress: (surah, ayah, page) => {
        const today = getToday();
        const state = get();
        const isNewDay = state.lastReadDate !== today;
        set({
          lastSurah: surah,
          lastAyah: ayah,
          currentPage: page,
          lastReadDate: today,
          streak: isNewDay ? state.streak + 1 : state.streak,
        });
      },
      resetDaily: () => set({ currentPage: 1 }),
    }),
    { name: "mashaf-wird" }
  )
);
