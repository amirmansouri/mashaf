"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getSurah, Surah, Ayah } from "@/lib/quranData";
import { useQuranStore } from "@/stores/quranStore";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAnnotationStore, Annotation } from "@/stores/annotationStore";

export default function SurahPage() {
  const params = useParams();
  const surahNumber = Number(params.surah);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setLastRead = useQuranStore((s) => s.setLastRead);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const getAnnotation = useAnnotationStore((s) => s.getAnnotation);
  const setAnnotation = useAnnotationStore((s) => s.setAnnotation);

  useEffect(() => {
    getSurah(surahNumber).then((s) => {
      setSurah(s || null);
      setLoading(false);
    });
  }, [surahNumber]);

  useEffect(() => {
    if (surah) {
      setLastRead(surah.number, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surah]);

  const handleAyahClick = (ayah: Ayah) => {
    setActiveAyah(activeAyah === ayah.numberInSurah ? null : ayah.numberInSurah);
    setLastRead(surahNumber, ayah.numberInSurah);
  };

  const handleBookmark = (ayahNum: number) => {
    if (isBookmarked(surahNumber, ayahNum)) {
      const bm = bookmarks.find((b) => b.surah === surahNumber && b.ayah === ayahNum);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark(surahNumber, ayahNum);
    }
  };

  const annotationColors: Annotation["color"][] = ["green", "yellow", "red", "blue", "purple"];
  const colorMap = {
    green: "bg-green-500/20 border-green-500/30",
    yellow: "bg-yellow-500/20 border-yellow-500/30",
    red: "bg-red-500/20 border-red-500/30",
    blue: "bg-blue-500/20 border-blue-500/30",
    purple: "bg-purple-500/20 border-purple-500/30",
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="..." showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="خطأ" showBack />
        <p className="text-center py-12 text-[var(--muted)]">السورة غير موجودة</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto" ref={containerRef}>
      <Header title={surah.name} showBack />

      {/* Surah Info */}
      <div className="text-center py-6 px-4">
        <div className="inline-block px-6 py-3 rounded-2xl bg-[var(--card)] border border-[var(--card-border)]">
          <p className="text-xl font-bold">{surah.name}</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            {surah.englishNameTranslation} • {surah.numberOfAyahs} آية • {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
          </p>
        </div>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <p className="text-center quran-text text-xl text-[var(--muted)] mb-6">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {/* Ayahs */}
      <div className="px-4 pb-24">
        {surah.ayahs.map((ayah) => {
          const annotation = getAnnotation(surahNumber, ayah.numberInSurah);
          const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);
          const isActive = activeAyah === ayah.numberInSurah;

          return (
            <div key={ayah.numberInSurah} className="mb-1">
              <div
                onClick={() => handleAyahClick(ayah)}
                className={`rounded-xl p-3 transition-all cursor-pointer border border-transparent ${
                  annotation ? colorMap[annotation.color] : ""
                } ${isActive ? "bg-[var(--card)] border-[var(--card-border)]" : "hover:bg-[var(--card)]/50"}`}
              >
                <p className="quran-text leading-[2.5]" style={{ fontSize: `${fontSize}px` }}>
                  {ayah.text}
                  <span className="ayah-marker">{ayah.numberInSurah}</span>
                </p>
              </div>

              {/* Action Bar (when active) */}
              {isActive && (
                <div className="flex items-center gap-1 px-2 py-2 animate-fade-in">
                  <button
                    onClick={() => handleBookmark(ayah.numberInSurah)}
                    className={`p-2 rounded-lg text-xs ${bookmarked ? "text-gold-400" : "text-[var(--muted)]"} hover:bg-[var(--card)]`}
                  >
                    {bookmarked ? "★" : "☆"} علامة
                  </button>
                  <span className="text-[var(--card-border)]">|</span>
                  {annotationColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAnnotation(surahNumber, ayah.numberInSurah, color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        annotation?.color === color ? "ring-2 ring-offset-1 ring-[var(--accent)]" : ""
                      }`}
                      style={{
                        backgroundColor: color === "green" ? "#22c55e" : color === "yellow" ? "#eab308" : color === "red" ? "#ef4444" : color === "blue" ? "#3b82f6" : "#a855f7",
                        borderColor: "transparent",
                      }}
                    />
                  ))}
                  <span className="text-[var(--card-border)]">|</span>
                  <button className="p-2 rounded-lg text-xs text-[var(--muted)] hover:bg-[var(--card)]">
                    ▶ تشغيل
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
