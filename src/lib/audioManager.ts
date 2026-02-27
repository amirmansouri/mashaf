"use client";

const AUDIO_CDN = "https://cdn.islamic.network/quran/audio-surah/128";

export interface ReciterInfo {
  id: string;
  name: string;
  style?: string;
}

export const reciters: ReciterInfo[] = [
  { id: "ar.alafasy", name: "مشاري العفاسي" },
  { id: "ar.abdurrahmaansudais", name: "عبدالرحمن السديس" },
  { id: "ar.husary", name: "محمود خليل الحصري" },
  { id: "ar.minshawi", name: "محمد صديق المنشاوي" },
  { id: "ar.abdulbasitmurattal", name: "عبدالباسط عبدالصمد", style: "مرتل" },
  { id: "ar.saaborehman", name: "سعود الشريم" },
  { id: "ar.maaborehman", name: "ماهر المعيقلي" },
];

export function getAudioUrl(reciterId: string, surahNumber: number): string {
  return `${AUDIO_CDN}/${reciterId}/${surahNumber}.mp3`;
}

export function getAyahAudioUrl(reciterId: string, surahNumber: number, ayahNumber: number): string {
  const surahStr = String(surahNumber).padStart(3, "0");
  const ayahStr = String(ayahNumber).padStart(3, "0");
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${surahStr}${ayahStr}.mp3`;
}
