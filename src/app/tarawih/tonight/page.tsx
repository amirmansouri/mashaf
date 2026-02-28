"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTarawihStore } from "@/stores/tarawihStore";
import { getJuzAyahs, Surah, Ayah } from "@/lib/quranData";
import { useSettingsStore } from "@/stores/settingsStore";

function TonightContent() {
  const searchParams = useSearchParams();
  const nightParam = searchParams.get("night");

  const { currentNight, getJuzForNight, markNightComplete, savePosition, savedPositions } = useTarawihStore();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [readAyahs, setReadAyahs] = useState(0);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [currentAyahNum, setCurrentAyahNum] = useState(0);
  const [selectedAyah, setSelectedAyah] = useState<{ surah: number; surahName: string; ayah: number; page: number } | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [positionSaved, setPositionSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Map<string, HTMLSpanElement>>(new Map());

  const night = nightParam ? parseInt(nightParam) : currentNight;
  const isReadOnly = nightParam ? useTarawihStore.getState().plan?.completedNights.includes(night) ?? false : false;
  const totalAyahs = sections.reduce((sum, s) => sum + s.ayahs.length, 0);
  const juzList = getJuzForNight(night);
  const savedPos = savedPositions[night];

  useEffect(() => {
    Promise.all(juzList.map((j) => getJuzAyahs(j))).then((results) => {
      setSections(results.flat());
      setLoading(false);
    });
  }, [night]);

  // Show resume banner if saved position exists
  useEffect(() => {
    if (!loading && savedPos) {
      setShowResumeBanner(true);
    }
  }, [loading, savedPos]);

  // Auto-scroll to saved position
  const scrollToSavedPosition = useCallback(() => {
    if (!savedPos) return;
    const key = `${savedPos.surah}-${savedPos.ayah}`;
    const el = ayahRefs.current.get(key);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-primary-600/20");
      setTimeout(() => el.classList.remove("bg-primary-600/20"), 2000);
    }
    setShowResumeBanner(false);
  }, [savedPos]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollPercent = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setReadAyahs(Math.round(scrollPercent * totalAyahs));

    // Determine current visible surah/ayah
    const entries = Array.from(ayahRefs.current.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, ref] = entries[i];
      const rect = ref.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        const [surahNum, ayahNum] = key.split("-").map(Number);
        const section = sections.find((s) => s.surah.number === surahNum);
        if (section) {
          setCurrentSurahName(section.surah.name);
          setCurrentAyahNum(ayahNum);
        }
        break;
      }
    }
  };

  const handleAyahTap = (surah: Surah, ayah: Ayah) => {
    if (selectedAyah?.surah === surah.number && selectedAyah?.ayah === ayah.numberInSurah) {
      setSelectedAyah(null);
    } else {
      setSelectedAyah({ surah: surah.number, surahName: surah.name, ayah: ayah.numberInSurah, page: ayah.page });
    }
  };

  const handleSavePosition = (surah: number, surahName: string, ayah: number, page: number) => {
    savePosition(night, surah, surahName, ayah, page);
    setSelectedAyah(null);
    setPositionSaved(true);
    setTimeout(() => setPositionSaved(false), 2000);
  };

  const handleFabSave = () => {
    // Save current visible position
    const fabEntries = Array.from(ayahRefs.current.entries());
    for (let i = 0; i < fabEntries.length; i++) {
      const [key, ref] = fabEntries[i];
      const rect = ref.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        const [surahNum, ayahNum] = key.split("-").map(Number);
        const section = sections.find((s) => s.surah.number === surahNum);
        if (section) {
          const ayah = section.ayahs.find((a) => a.numberInSurah === ayahNum);
          handleSavePosition(surahNum, section.surah.name, ayahNum, ayah?.page ?? 0);
        }
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title={`ليلة ${night}`} showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header
        title={`ليلة ${night} - الجزء ${juzList.join(" و ")}`}
        showBack
      />

      {/* Sticky sub-header with current position */}
      <div className="sticky top-14 z-30 bg-[var(--background)] px-4 py-2 space-y-1">
        {currentSurahName && (
          <p className="text-xs text-center text-[var(--muted)]">
            {currentSurahName} — آية {currentAyahNum}
          </p>
        )}
        <ProgressBar progress={totalAyahs ? (readAyahs / totalAyahs) * 100 : 0} showLabel />
      </div>

      {/* Resume banner */}
      {showResumeBanner && savedPos && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-primary-400">متابعة من آخر موضع</p>
            <p className="text-xs text-[var(--muted)]">
              {savedPos.surahName} — آية {savedPos.ayah}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResumeBanner(false)}
              className="text-xs px-3 py-1.5 rounded-lg text-[var(--muted)]"
            >
              تخطي
            </button>
            <button
              onClick={scrollToSavedPosition}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium"
            >
              متابعة
            </button>
          </div>
        </div>
      )}

      {/* Save position popup for selected ayah */}
      {selectedAyah && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm">
            {selectedAyah.surahName} — آية {selectedAyah.ayah}
          </p>
          <button
            onClick={() => handleSavePosition(selectedAyah.surah, selectedAyah.surahName, selectedAyah.ayah, selectedAyah.page)}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            حفظ الموضع
          </button>
        </div>
      )}

      {/* Position saved toast */}
      {positionSaved && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-primary-600 text-white text-center text-sm font-medium animate-in fade-in duration-200">
          تم حفظ الموضع ✓
        </div>
      )}

      <div ref={scrollRef} className="px-4 pb-24 overflow-y-auto" onScroll={handleScroll}>
        {sections.map(({ surah, ayahs }) => (
          <div key={`${surah.number}-${ayahs[0]?.numberInSurah}`} className="mb-8">
            <div className="text-center py-4 mb-4">
              <div className="inline-block px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <p className="font-bold">{surah.name}</p>
              </div>
            </div>
            <div className="quran-text leading-[2.5]" style={{ fontSize: `${fontSize}px` }}>
              {ayahs.map((ayah) => {
                const isBookmarked = savedPos?.surah === surah.number && savedPos?.ayah === ayah.numberInSurah;
                const isSelected = selectedAyah?.surah === surah.number && selectedAyah?.ayah === ayah.numberInSurah;
                return (
                  <span
                    key={ayah.numberInSurah}
                    ref={(el) => {
                      if (el) ayahRefs.current.set(`${surah.number}-${ayah.numberInSurah}`, el);
                    }}
                    onClick={() => handleAyahTap(surah, ayah)}
                    className={`cursor-pointer rounded transition-colors ${
                      isSelected ? "bg-primary-600/20" : isBookmarked ? "bg-gold-600/10" : ""
                    }`}
                  >
                    {ayah.text}
                    <span className="ayah-marker inline-flex items-center">
                      {ayah.numberInSurah}
                      {isBookmarked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gold-500 inline mr-0.5">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      )}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        {!isReadOnly && (
          <div className="py-8">
            <Button fullWidth size="lg" onClick={() => markNightComplete(night)}>
              تم إكمال ليلة {night} ✓
            </Button>
          </div>
        )}
      </div>

      {/* Floating save position FAB */}
      {!isReadOnly && (
        <button
          onClick={handleFabSave}
          className="fixed bottom-20 left-4 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
          aria-label="حفظ الموضع"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6 3a2 2 0 00-2 2v16l8-3 8 3V5a2 2 0 00-2-2H6z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function TonightPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto">
        <Header title="قراءة الليلة" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    }>
      <TonightContent />
    </Suspense>
  );
}
