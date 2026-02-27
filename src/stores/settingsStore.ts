import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  fontSize: number;
  showTranslation: boolean;
  translationLang: string;
  reciter: string;
  playbackSpeed: number;
  prayerMethod: string;
  location: { lat: number; lng: number; city: string } | null;
  setFontSize: (size: number) => void;
  setShowTranslation: (show: boolean) => void;
  setTranslationLang: (lang: string) => void;
  setReciter: (reciter: string) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPrayerMethod: (method: string) => void;
  setLocation: (location: { lat: number; lng: number; city: string }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 28,
      showTranslation: false,
      translationLang: "ar",
      reciter: "mishari_rashid_alafasy",
      playbackSpeed: 1,
      prayerMethod: "MWL",
      location: null,
      setFontSize: (fontSize) => set({ fontSize }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setTranslationLang: (translationLang) => set({ translationLang }),
      setReciter: (reciter) => set({ reciter }),
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
      setPrayerMethod: (prayerMethod) => set({ prayerMethod }),
      setLocation: (location) => set({ location }),
    }),
    { name: "mashaf-settings" }
  )
);
