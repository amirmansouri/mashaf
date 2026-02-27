import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface KhatmGroup {
  id: string;
  name: string;
  createdAt: number;
  members: { name: string; assignedJuz: number[]; completed: number[] }[];
}

interface KhatmState {
  groups: KhatmGroup[];
  createGroup: (name: string) => string;
  joinGroup: (groupId: string, memberName: string) => void;
  assignJuz: (groupId: string, memberName: string, juz: number[]) => void;
  markJuzComplete: (groupId: string, memberName: string, juz: number) => void;
  getGroup: (groupId: string) => KhatmGroup | undefined;
  deleteGroup: (groupId: string) => void;
}

export const useKhatmStore = create<KhatmState>()(
  persist(
    (set, get) => ({
      groups: [],
      createGroup: (name) => {
        const id = `khatm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          groups: [...state.groups, { id, name, createdAt: Date.now(), members: [] }],
        }));
        return id;
      },
      joinGroup: (groupId, memberName) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, members: [...g.members, { name: memberName, assignedJuz: [], completed: [] }] }
              : g
          ),
        })),
      assignJuz: (groupId, memberName, juz) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  members: g.members.map((m) =>
                    m.name === memberName ? { ...m, assignedJuz: juz } : m
                  ),
                }
              : g
          ),
        })),
      markJuzComplete: (groupId, memberName, juz) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  members: g.members.map((m) =>
                    m.name === memberName
                      ? { ...m, completed: Array.from(new Set([...m.completed, juz])) }
                      : m
                  ),
                }
              : g
          ),
        })),
      getGroup: (groupId) => get().groups.find((g) => g.id === groupId),
      deleteGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),
    }),
    { name: "mashaf-khatm" }
  )
);
