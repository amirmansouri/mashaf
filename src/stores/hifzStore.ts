import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HifzEntry {
  surah: number;
  fromAyah: number;
  toAyah: number;
  status: "memorized" | "reviewing" | "new";
  lastReviewed: number;
  nextReview: number;
  strength: number; // 1-5
}

interface HifzState {
  entries: HifzEntry[];
  dailyGoalPages: number;
  addEntry: (entry: Omit<HifzEntry, "lastReviewed" | "nextReview" | "strength">) => void;
  updateEntry: (surah: number, fromAyah: number, updates: Partial<HifzEntry>) => void;
  removeEntry: (surah: number, fromAyah: number) => void;
  setDailyGoal: (pages: number) => void;
  getReviewDue: () => HifzEntry[];
}

export const useHifzStore = create<HifzState>()(
  persist(
    (set, get) => ({
      entries: [],
      dailyGoalPages: 1,
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              lastReviewed: Date.now(),
              nextReview: Date.now() + 24 * 60 * 60 * 1000,
              strength: 1,
            },
          ],
        })),
      updateEntry: (surah, fromAyah, updates) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.surah === surah && e.fromAyah === fromAyah
              ? { ...e, ...updates }
              : e
          ),
        })),
      removeEntry: (surah, fromAyah) =>
        set((state) => ({
          entries: state.entries.filter(
            (e) => !(e.surah === surah && e.fromAyah === fromAyah)
          ),
        })),
      setDailyGoal: (dailyGoalPages) => set({ dailyGoalPages }),
      getReviewDue: () =>
        get().entries.filter((e) => e.nextReview <= Date.now()),
    }),
    { name: "mashaf-hifz" }
  )
);
