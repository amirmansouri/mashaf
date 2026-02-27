import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TarawihPlan {
  totalNights: number; // 10, 20, or 30
  startDate: string;
  completedNights: number[];
}

interface TarawihState {
  plan: TarawihPlan | null;
  currentNight: number;
  createPlan: (totalNights: number) => void;
  markNightComplete: (night: number) => void;
  resetPlan: () => void;
  getJuzForNight: (night: number) => number[];
}

export const useTarawihStore = create<TarawihState>()(
  persist(
    (set, get) => ({
      plan: null,
      currentNight: 1,
      createPlan: (totalNights) =>
        set({
          plan: {
            totalNights,
            startDate: new Date().toISOString(),
            completedNights: [],
          },
          currentNight: 1,
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
      resetPlan: () => set({ plan: null, currentNight: 1 }),
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
    }),
    { name: "mashaf-tarawih" }
  )
);
