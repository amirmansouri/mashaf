import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedPosition {
  surah: number;
  surahName: string;
  ayah: number;
  page: number;
  timestamp: number;
}

export type NightFilter = "all" | "completed" | "remaining" | "current";

interface TarawihPlan {
  totalNights: number; // 10, 20, or 30
  startDate: string;
  completedNights: number[];
}

interface TarawihState {
  plan: TarawihPlan | null;
  currentNight: number;
  savedPositions: Record<number, SavedPosition>;
  nightFilter: NightFilter;
  hizbLog: Record<number, number>; // night -> hizbs read that night
  createPlan: (totalNights: number) => void;
  markNightComplete: (night: number) => void;
  resetPlan: () => void;
  getJuzForNight: (night: number) => number[];
  savePosition: (night: number, surah: number, surahName: string, ayah: number, page: number) => void;
  clearPosition: (night: number) => void;
  setNightFilter: (filter: NightFilter) => void;
  setHizbLog: (night: number, hizbs: number) => void;
  removeHizbLog: (night: number) => void;
  getTotalHizbRead: (upToNight: number) => number;
}

export const useTarawihStore = create<TarawihState>()(
  persist(
    (set, get) => ({
      plan: null,
      currentNight: 1,
      savedPositions: {},
      nightFilter: "all",
      hizbLog: {},
      createPlan: (totalNights) =>
        set({
          plan: {
            totalNights,
            startDate: new Date().toISOString(),
            completedNights: [],
          },
          currentNight: 1,
          savedPositions: {},
        }),
      markNightComplete: (night) =>
        set((state) => ({
          plan: state.plan
            ? {
                ...state.plan,
                completedNights: Array.from(new Set([...state.plan.completedNights, night])),
              }
            : null,
          currentNight: night + 1,
        })),
      resetPlan: () => set({ plan: null, currentNight: 1, savedPositions: {}, nightFilter: "all" }),
      getJuzForNight: (night) => {
        const plan = get().plan;
        if (!plan) return [];
        const juzPerNight = 30 / plan.totalNights;
        const startJuz = Math.floor((night - 1) * juzPerNight) + 1;
        const endJuz = Math.floor(night * juzPerNight);
        const juzList: number[] = [];
        for (let j = startJuz; j <= endJuz; j++) {
          juzList.push(j);
        }
        return juzList;
      },
      savePosition: (night, surah, surahName, ayah, page) =>
        set((state) => ({
          savedPositions: {
            ...state.savedPositions,
            [night]: { surah, surahName, ayah, page, timestamp: Date.now() },
          },
        })),
      clearPosition: (night) =>
        set((state) => {
          const { [night]: _removed, ...rest } = state.savedPositions;
          void _removed;
          return { savedPositions: rest };
        }),
      setNightFilter: (filter) => set({ nightFilter: filter }),
      setHizbLog: (night, hizbs) =>
        set((state) => ({
          hizbLog: { ...state.hizbLog, [night]: hizbs },
        })),
      removeHizbLog: (night) =>
        set((state) => {
          const { [night]: _removed, ...rest } = state.hizbLog;
          void _removed;
          return { hizbLog: rest };
        }),
      getTotalHizbRead: (upToNight) => {
        const log = get().hizbLog;
        let total = 0;
        for (let i = 1; i <= upToNight; i++) {
          total += log[i] || 0;
        }
        return total;
      },
    }),
    { name: "mashaf-tarawih" }
  )
);
