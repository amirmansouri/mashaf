import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DailyReading {
  date: string; // YYYY-MM-DD
  pagesRead: number;
  minutesRead: number;
  ayahsRead: number;
}

interface StatsState {
  readings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalKhatm: number;
  logReading: (pages: number, minutes: number, ayahs: number) => void;
  completeKhatm: () => void;
  getTodayStats: () => DailyReading | undefined;
  getWeekStats: () => DailyReading[];
}

const getToday = () => new Date().toISOString().split("T")[0];

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      readings: [],
      currentStreak: 0,
      longestStreak: 0,
      totalKhatm: 0,
      logReading: (pages, minutes, ayahs) =>
        set((state) => {
          const today = getToday();
          const existing = state.readings.find((r) => r.date === today);
          let readings: DailyReading[];
          if (existing) {
            readings = state.readings.map((r) =>
              r.date === today
                ? {
                    ...r,
                    pagesRead: r.pagesRead + pages,
                    minutesRead: r.minutesRead + minutes,
                    ayahsRead: r.ayahsRead + ayahs,
                  }
                : r
            );
          } else {
            readings = [
              ...state.readings,
              { date: today, pagesRead: pages, minutesRead: minutes, ayahsRead: ayahs },
            ];
          }
          // Calculate streak
          let streak = 0;
          const sortedDates = readings.map((r) => r.date).sort().reverse();
          for (let i = 0; i < sortedDates.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            if (sortedDates[i] === expected.toISOString().split("T")[0]) {
              streak++;
            } else break;
          }
          return {
            readings,
            currentStreak: streak,
            longestStreak: Math.max(state.longestStreak, streak),
          };
        }),
      completeKhatm: () =>
        set((state) => ({ totalKhatm: state.totalKhatm + 1 })),
      getTodayStats: () =>
        get().readings.find((r) => r.date === getToday()),
      getWeekStats: () => {
        const week: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          week.push(d.toISOString().split("T")[0]);
        }
        return week.map(
          (date) =>
            get().readings.find((r) => r.date === date) || {
              date,
              pagesRead: 0,
              minutesRead: 0,
              ayahsRead: 0,
            }
        );
      },
    }),
    { name: "mashaf-stats" }
  )
);
