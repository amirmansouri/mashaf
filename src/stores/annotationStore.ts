import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Annotation {
  surah: number;
  ayah: number;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  note?: string;
}

interface AnnotationState {
  annotations: Annotation[];
  setAnnotation: (surah: number, ayah: number, color: Annotation["color"], note?: string) => void;
  removeAnnotation: (surah: number, ayah: number) => void;
  getAnnotation: (surah: number, ayah: number) => Annotation | undefined;
}

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set, get) => ({
      annotations: [],
      setAnnotation: (surah, ayah, color, note) =>
        set((state) => {
          const filtered = state.annotations.filter(
            (a) => !(a.surah === surah && a.ayah === ayah)
          );
          return { annotations: [...filtered, { surah, ayah, color, note }] };
        }),
      removeAnnotation: (surah, ayah) =>
        set((state) => ({
          annotations: state.annotations.filter(
            (a) => !(a.surah === surah && a.ayah === ayah)
          ),
        })),
      getAnnotation: (surah, ayah) =>
        get().annotations.find((a) => a.surah === surah && a.ayah === ayah),
    }),
    { name: "mashaf-annotations" }
  )
);
