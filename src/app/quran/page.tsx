"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { surahNames } from "@/lib/quranData";
import { useQuranStore } from "@/stores/quranStore";

export default function QuranPage() {
  const [search, setSearch] = useState("");
  const viewMode = useQuranStore((s) => s.viewMode);
  const setViewMode = useQuranStore((s) => s.setViewMode);

  const filteredSurahs = surahNames.filter(
    (s) => s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number) === search
  );

  return (
    <div className="max-w-lg mx-auto">
      <Header title="القرآن الكريم" />

      {/* Search Bar */}
      <div className="px-4 py-3 sticky top-14 z-30 bg-[var(--background)]">
        <input
          type="text"
          placeholder="ابحث عن سورة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
        />

        {/* View Mode Tabs */}
        <div className="flex gap-2 mt-3">
          {(["surah", "juz", "hizb", "page"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-primary-600 text-white"
                  : "bg-[var(--card)] text-[var(--muted)]"
              }`}
            >
              {mode === "surah" ? "سور" : mode === "juz" ? "أجزاء" : mode === "hizb" ? "أحزاب" : "صفحات"}
            </button>
          ))}
        </div>
      </div>

      {/* Surah List */}
      {viewMode === "surah" && (
        <div className="px-4 pb-6">
          {filteredSurahs.map((surah) => (
            <Link key={surah.number} href={`/quran/${surah.number}`}>
              <div className="flex items-center gap-4 py-3 border-b border-[var(--card-border)] hover:bg-[var(--card)] px-2 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center text-primary-500 font-bold text-sm">
                  {surah.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{surah.name}</p>
                    <p className="text-sm text-[var(--muted)]">{surah.englishName}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--muted)]">{surah.type}</span>
                    <span className="text-[10px] text-[var(--muted)]">•</span>
                    <span className="text-[10px] text-[var(--muted)]">{surah.ayahs} آية</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Juz List */}
      {viewMode === "juz" && (
        <div className="px-4 pb-6 grid grid-cols-3 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <Link key={juz} href={`/quran/juz/${juz}`}>
              <div className="card text-center py-4 hover:border-[var(--accent)] transition-colors">
                <p className="text-2xl font-bold text-[var(--accent)]">{juz}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">الجزء {juz}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Hizb List */}
      {viewMode === "hizb" && (
        <div className="px-4 pb-6 grid grid-cols-3 gap-2">
          {Array.from({ length: 60 }, (_, i) => i + 1).map((hizb) => (
            <Link key={hizb} href={`/quran/hizb/${hizb}`}>
              <div className="card text-center py-4 hover:border-[var(--accent)] transition-colors">
                <p className="text-2xl font-bold text-[var(--accent)]">{hizb}</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">الحزب {hizb}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Page List */}
      {viewMode === "page" && (
        <div className="px-4 pb-6">
          <p className="text-center text-[var(--muted)] py-8 text-sm">
            عرض الصفحات قريباً إن شاء الله
          </p>
        </div>
      )}
    </div>
  );
}
