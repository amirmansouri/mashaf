"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useLivreStore } from "@/stores/livreStore";
import { getPageAyahs, getJuzAyahs, getHizbAyahs, searchQuran, getSurah, getHizbStartPosition, Surah, Ayah, surahNames, HizbPosition } from "@/lib/quranData";

type SearchTab = "tracker" | "surah" | "hizb" | "juz" | "page" | "search";
type ContentSource = { type: "page"; page: number } | { type: "juz"; juz: number } | { type: "hizb"; hizb: number } | { type: "surah"; surahNum: number } | { type: "search"; query: string };

export default function LivreModePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    }>
      <LivreModeContent />
    </Suspense>
  );
}

function LivreModeContent() {
  const searchParams = useSearchParams();
  const { currentPage, setCurrentPage, savedPosition, savePosition: storeSavePosition, hizbLog, setHizbLog, removeHizbLog, autoScrollSpeed, setAutoScrollSpeed } = useLivreStore();

  const initialPage = Number(searchParams.get("page")) || currentPage;
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(autoScrollSpeed);
  const [currentSurahName, setCurrentSurahName] = useState("");
  const [currentAyahNum, setCurrentAyahNum] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedAyah, setSelectedAyah] = useState<{ surah: number; surahName: string; ayah: number; page: number } | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [positionSaved, setPositionSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ayahRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const touchStartX = useRef(0);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchTab, setSearchTab] = useState<SearchTab>("surah");
  const [surahFilter, setSurahFilter] = useState("");
  const [textQuery, setTextQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ surah: Surah; ayah: Ayah }[]>([]);
  const [searching, setSearching] = useState(false);
  const [contentSource, setContentSource] = useState<ContentSource>({ type: "page", page: initialPage });
  const [pageJumpInput, setPageJumpInput] = useState("");

  // Tracker state
  const [trackerInput, setTrackerInput] = useState("");
  const [trackerEditDay, setTrackerEditDay] = useState<number | null>(null);
  const [trackerPosition, setTrackerPosition] = useState<HizbPosition | null>(null);
  const [trackerLoading, setTrackerLoading] = useState(false);

  // Load content based on source
  const loadContent = useCallback(async (source: ContentSource) => {
    setLoading(true);
    ayahRefs.current.clear();
    try {
      let result: { surah: Surah; ayahs: Ayah[] }[] = [];
      switch (source.type) {
        case "page": {
          result = await getPageAyahs(source.page);
          setCurrentPage(source.page);
          break;
        }
        case "juz": {
          result = await getJuzAyahs(source.juz);
          break;
        }
        case "hizb": {
          result = await getHizbAyahs(source.hizb);
          break;
        }
        case "surah": {
          const surah = await getSurah(source.surahNum);
          if (surah) {
            result = [{ surah, ayahs: surah.ayahs }];
          }
          break;
        }
        case "search": {
          const searchRes = await searchQuran(source.query);
          const grouped = new Map<number, { surah: Surah; ayahs: Ayah[] }>();
          for (const { surah, ayah } of searchRes.slice(0, 100)) {
            if (!grouped.has(surah.number)) {
              grouped.set(surah.number, { surah, ayahs: [] });
            }
            grouped.get(surah.number)!.ayahs.push(ayah);
          }
          result = Array.from(grouped.values());
          break;
        }
      }
      setSections(result);
    } finally {
      setLoading(false);
    }
  }, [setCurrentPage]);

  useEffect(() => {
    loadContent(contentSource);
  }, [contentSource, loadContent]);

  useEffect(() => {
    if (!loading && savedPosition && contentSource.type === "page") {
      setShowResumeBanner(true);
    }
  }, [loading, savedPosition, contentSource]);

  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;
    const interval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  // Persist scroll speed
  useEffect(() => {
    setAutoScrollSpeed(scrollSpeed);
  }, [scrollSpeed, setAutoScrollSpeed]);

  const scrollToSavedPosition = useCallback(() => {
    if (!savedPosition) return;
    if (savedPosition.page !== (contentSource.type === "page" ? contentSource.page : 0)) {
      setContentSource({ type: "page", page: savedPosition.page });
    }
    setTimeout(() => {
      const key = `${savedPosition.surah}-${savedPosition.ayah}`;
      const el = ayahRefs.current.get(key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-primary-600/30");
        setTimeout(() => el.classList.remove("bg-primary-600/30"), 2000);
      }
    }, 500);
    setShowResumeBanner(false);
  }, [savedPosition, contentSource]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress((el.scrollTop / maxScroll) * 100);
    }
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
    if (autoScroll) setAutoScroll(false);
    if (selectedAyah?.surah === surah.number && selectedAyah?.ayah === ayah.numberInSurah) {
      setSelectedAyah(null);
    } else {
      setSelectedAyah({ surah: surah.number, surahName: surah.name, ayah: ayah.numberInSurah, page: ayah.page });
    }
  };

  const handleSavePosition = (surah: number, surahName: string, ayah: number, page: number) => {
    storeSavePosition(page, surah, surahName, ayah);
    setSelectedAyah(null);
    setPositionSaved(true);
    setTimeout(() => setPositionSaved(false), 2000);
  };

  const handleFabSave = () => {
    if (autoScroll) setAutoScroll(false);
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

  // Touch swipe for page navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (contentSource.type !== "page") return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 80) {
      // RTL: swipe left = next page, swipe right = prev page
      if (diff < 0 && contentSource.page < 604) {
        navigateTo({ type: "page", page: contentSource.page + 1 });
      } else if (diff > 0 && contentSource.page > 1) {
        navigateTo({ type: "page", page: contentSource.page - 1 });
      }
    }
  };

  // Tracker: get sorted days from hizbLog
  const trackerDays = Object.keys(hizbLog).map(Number).sort((a, b) => a - b);
  const trackerTotal = trackerDays.reduce((sum, d) => sum + (hizbLog[d] || 0), 0);
  const trackerNextDay = trackerDays.length > 0 ? Math.max(...trackerDays) + 1 : 1;

  const getCumulativeTotal = (day: number) => {
    let total = 0;
    for (const d of trackerDays) {
      if (d <= day) total += hizbLog[d] || 0;
    }
    return total;
  };

  const handleTrackerAdd = (day: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    setHizbLog(day, num);
    setTrackerInput("");
    setTrackerEditDay(null);
  };

  const loadTrackerPosition = useCallback(async () => {
    setTrackerLoading(true);
    try {
      const pos = await getHizbStartPosition(trackerTotal);
      setTrackerPosition(pos);
    } finally {
      setTrackerLoading(false);
    }
  }, [trackerTotal]);

  useEffect(() => {
    if (showSearch && searchTab === "tracker") {
      loadTrackerPosition();
    }
  }, [showSearch, searchTab, loadTrackerPosition]);

  const navigateTo = (source: ContentSource) => {
    setContentSource(source);
    setShowSearch(false);
    setSelectedAyah(null);
    setScrollProgress(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const backToPage = () => {
    navigateTo({ type: "page", page: currentPage });
  };

  const handleTextSearch = async () => {
    if (!textQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchQuran(textQuery.trim());
      setSearchResults(results.slice(0, 50));
    } finally {
      setSearching(false);
    }
  };

  const getContentTitle = () => {
    switch (contentSource.type) {
      case "page": return `صفحة ${contentSource.page}`;
      case "juz": return `الجزء ${contentSource.juz}`;
      case "hizb": return `الحزب ${contentSource.hizb}`;
      case "surah": {
        const s = surahNames.find(s => s.number === contentSource.surahNum);
        return s ? `سورة ${s.name}` : "";
      }
      case "search": return `نتائج: "${contentSource.query}"`;
    }
  };

  const filteredSurahs = surahFilter
    ? surahNames.filter(s =>
        s.name.includes(surahFilter) ||
        s.englishName.toLowerCase().includes(surahFilter.toLowerCase()) ||
        s.number.toString() === surahFilter
      )
    : surahNames;

  // Build flat list with hizb separators
  const flatItems: ({ type: "ayah"; surah: Surah; ayah: Ayah } | { type: "surah-header"; name: string } | { type: "hizb-separator"; hizbQuarter: number })[] = [];
  if (!loading) {
    let prevHizbQuarter = 0;
    for (const { surah, ayahs } of sections) {
      flatItems.push({ type: "surah-header", name: surah.name });
      for (const ayah of ayahs) {
        if (prevHizbQuarter !== 0 && ayah.hizbQuarter !== prevHizbQuarter) {
          flatItems.push({ type: "hizb-separator", hizbQuarter: ayah.hizbQuarter });
        }
        prevHizbQuarter = ayah.hizbQuarter;
        flatItems.push({ type: "ayah", surah, ayah });
      }
    }
  }

  const handlePageJump = () => {
    const num = parseInt(pageJumpInput);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      navigateTo({ type: "page", page: num });
      setPageJumpInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Top Controls */}
      <div className="shrink-0 bg-black/80 backdrop-blur z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/quran" className="text-sm text-primary-400">رجوع</a>
          <div className="text-center flex-1 mx-2">
            <span className="text-sm font-bold">
              {contentSource.type === "page" ? `وضع المصحف — ${getContentTitle()}` : getContentTitle()}
            </span>
            {currentSurahName && (
              <p className="text-[10px] text-gray-400">{currentSurahName} — آية {currentAyahNum}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {contentSource.type !== "page" && (
              <button
                onClick={backToPage}
                className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300"
              >
                الصفحة
              </button>
            )}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 rounded-full text-xs ${autoScroll ? "bg-primary-600" : "bg-gray-700"}`}
            >
              {autoScroll ? "إيقاف" : "تمرير"}
            </button>
          </div>
        </div>

        {autoScroll && (
          <div className="flex items-center justify-center gap-4 py-2 bg-gray-900">
            <button onClick={() => setScrollSpeed(Math.max(0.5, scrollSpeed - 0.5))} className="w-8 h-8 rounded-full bg-gray-700 text-lg">-</button>
            <span className="text-sm">السرعة: {scrollSpeed}x</span>
            <button onClick={() => setScrollSpeed(Math.min(5, scrollSpeed + 0.5))} className="w-8 h-8 rounded-full bg-gray-700 text-lg">+</button>
          </div>
        )}

        <div className="w-full h-1 bg-gray-800">
          <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>

      {/* Resume banner */}
      {showResumeBanner && savedPosition && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-between shrink-0">
          <div>
            <p className="text-sm font-bold text-primary-400">متابعة من آخر موضع</p>
            <p className="text-xs text-gray-400">{savedPosition.surahName} — آية {savedPosition.ayah} — صفحة {savedPosition.page}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowResumeBanner(false)} className="text-xs px-3 py-1.5 rounded-lg text-gray-400">تخطي</button>
            <button onClick={scrollToSavedPosition} className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium">متابعة</button>
          </div>
        </div>
      )}

      {/* Save position popup */}
      {selectedAyah && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-between shrink-0">
          <p className="text-sm">{selectedAyah.surahName} — آية {selectedAyah.ayah}</p>
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

      {positionSaved && (
        <div className="mx-4 mt-2 p-2 rounded-xl bg-primary-600 text-white text-center text-sm font-medium shrink-0">
          تم حفظ الموضع
        </div>
      )}

      {/* Content area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto px-6 py-8"
      >
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && sections.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">لا توجد نتائج</p>
          </div>
        )}

        {!loading && flatItems.map((item, idx) => {
          if (item.type === "surah-header") {
            return (
              <p key={`sh-${idx}`} className="text-center text-2xl font-bold mb-6 mt-8 text-primary-400">
                {item.name}
              </p>
            );
          }
          if (item.type === "hizb-separator") {
            const hizbNum = Math.ceil(item.hizbQuarter / 2);
            return (
              <div key={`hq-${idx}`} className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gold-600/30" />
                <span className="text-xs font-bold text-gold-500 whitespace-nowrap">الحزب {hizbNum}</span>
                <div className="flex-1 h-px bg-gold-600/30" />
              </div>
            );
          }
          const { surah, ayah } = item;
          const isSaved = savedPosition?.surah === surah.number && savedPosition?.ayah === ayah.numberInSurah;
          const isSelected = selectedAyah?.surah === surah.number && selectedAyah?.ayah === ayah.numberInSurah;
          return (
            <span
              key={`a-${surah.number}-${ayah.numberInSurah}`}
              ref={(el) => {
                if (el) ayahRefs.current.set(`${surah.number}-${ayah.numberInSurah}`, el);
              }}
              onClick={() => handleAyahTap(surah, ayah)}
              className={`imam-text cursor-pointer rounded transition-colors ${
                isSelected ? "bg-primary-600/30" : isSaved ? "bg-gold-600/20" : ""
              }`}
            >
              {ayah.text}
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-600/20 text-primary-400 text-base font-bold mx-2">
                {ayah.numberInSurah}
                {isSaved && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gold-500 absolute -top-1 -right-1">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                )}
              </span>
            </span>
          );
        })}
      </div>

      {/* Page Navigation Bar */}
      {contentSource.type === "page" && (
        <div className="shrink-0 bg-black/80 backdrop-blur border-t border-gray-800 px-4 py-2 flex items-center justify-between z-10">
          <button
            onClick={() => navigateTo({ type: "page", page: contentSource.page + 1 })}
            disabled={contentSource.page >= 604}
            className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm disabled:opacity-30 active:scale-95 transition-transform"
          >
            السابقة
          </button>
          <span className="text-sm text-primary-400 font-bold">
            صفحة {contentSource.page} / 604
          </span>
          <button
            onClick={() => navigateTo({ type: "page", page: contentSource.page - 1 })}
            disabled={contentSource.page <= 1}
            className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm disabled:opacity-30 active:scale-95 transition-transform"
          >
            التالية
          </button>
        </div>
      )}

      {/* Floating save position FAB */}
      <button
        onClick={handleFabSave}
        className={`fixed ${contentSource.type === "page" ? "bottom-20" : "bottom-6"} left-4 w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40`}
        aria-label="حفظ الموضع"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M6 3a2 2 0 00-2 2v16l8-3 8 3V5a2 2 0 00-2-2H6z" />
        </svg>
      </button>

      {/* Search FAB */}
      <button
        onClick={() => { setShowSearch(true); setSearchTab("surah"); }}
        className={`fixed ${contentSource.type === "page" ? "bottom-20" : "bottom-6"} right-4 w-12 h-12 rounded-full bg-gold-600 text-black shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40`}
        aria-label="بحث وتنقل"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="shrink-0 px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">البحث والتنقل</h2>
              <button
                onClick={() => setShowSearch(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
              {([
                { key: "tracker" as SearchTab, label: "متابعة" },
                { key: "surah" as SearchTab, label: "سورة" },
                { key: "hizb" as SearchTab, label: "حزب" },
                { key: "juz" as SearchTab, label: "جزء" },
                { key: "page" as SearchTab, label: "صفحة" },
                { key: "search" as SearchTab, label: "بحث" },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSearchTab(tab.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    searchTab === tab.key ? "bg-primary-600 text-white" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {/* Tracker Tab */}
            {searchTab === "tracker" && (
              <div className="pt-3 space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gold-600/20 to-gold-600/5 border border-gold-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gold-500">موضعك الحالي</h3>
                    <span className="text-xs text-gray-400">{trackerTotal} / 60 حزب</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-800 mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-600 transition-all duration-500"
                      style={{ width: `${Math.min((trackerTotal / 60) * 100, 100)}%` }}
                    />
                  </div>
                  {trackerLoading ? (
                    <div className="flex justify-center py-3">
                      <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : trackerPosition ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">الحزب</span>
                        <span className="text-sm font-bold text-gold-400">{trackerPosition.hizb}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">السورة</span>
                        <span className="text-sm font-bold">{trackerPosition.surahName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">الآية</span>
                        <span className="text-sm font-bold">{trackerPosition.ayah}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">الصفحة</span>
                        <span className="text-sm font-bold">{trackerPosition.page}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">الجزء</span>
                        <span className="text-sm font-bold">{trackerPosition.juz}</span>
                      </div>
                      <button
                        onClick={() => navigateTo({ type: "hizb", hizb: trackerPosition.hizb })}
                        className="w-full mt-2 py-2.5 rounded-xl bg-gold-600 text-black text-sm font-bold active:scale-95 transition-transform"
                      >
                        اذهب إلى الموضع
                      </button>
                    </div>
                  ) : trackerTotal === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">أضف قراءتك اليومية للبدء</p>
                  ) : null}
                </div>

                <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800">
                  <h3 className="text-sm font-bold mb-3">
                    {trackerEditDay ? `تعديل يوم ${trackerEditDay}` : `إضافة يوم ${trackerNextDay}`}
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={trackerInput}
                      onChange={(e) => setTrackerInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTrackerAdd(trackerEditDay || trackerNextDay, trackerInput)}
                      placeholder="عدد الأحزاب (مثال: 2.5)"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleTrackerAdd(trackerEditDay || trackerNextDay, trackerInput)}
                      disabled={!trackerInput || isNaN(parseFloat(trackerInput)) || parseFloat(trackerInput) <= 0}
                      className="px-4 py-2.5 rounded-xl bg-gold-600 text-black text-sm font-bold disabled:opacity-50 active:scale-95 transition-transform"
                    >
                      {trackerEditDay ? "تعديل" : "إضافة"}
                    </button>
                    {trackerEditDay && (
                      <button
                        onClick={() => { setTrackerEditDay(null); setTrackerInput(""); }}
                        className="px-3 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 1.5, 2, 2.5, 3].map(v => (
                      <button
                        key={v}
                        onClick={() => setTrackerInput(v.toString())}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          trackerInput === v.toString()
                            ? "bg-gold-600/30 text-gold-400 border border-gold-600/50"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {trackerDays.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2 text-gray-300">سجل القراءة</h3>
                    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
                      <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-gray-800/50 text-[11px] text-gray-500 font-medium">
                        <span>اليوم</span>
                        <span>الأحزاب</span>
                        <span>المجموع</span>
                        <span></span>
                      </div>
                      {trackerDays.map(day => (
                        <div key={day} className="grid grid-cols-4 gap-1 px-3 py-2.5 border-t border-gray-800/50 items-center">
                          <span className="text-sm font-bold text-primary-400">{day}</span>
                          <span className="text-sm text-gold-400">{hizbLog[day]}</span>
                          <span className="text-sm text-gray-300">{getCumulativeTotal(day)}</span>
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => { setTrackerEditDay(day); setTrackerInput(hizbLog[day].toString()); }}
                              className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
                                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeHizbLog(day)}
                              className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-red-400">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Surah Tab */}
            {searchTab === "surah" && (
              <div>
                <div className="sticky top-0 bg-black/95 backdrop-blur pt-2 pb-3 z-10">
                  <input
                    type="text"
                    value={surahFilter}
                    onChange={(e) => setSurahFilter(e.target.value)}
                    placeholder="ابحث عن سورة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  {filteredSurahs.map(s => (
                    <button
                      key={s.number}
                      onClick={() => navigateTo({ type: "surah", surahNum: s.number })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-900 active:bg-gray-800 transition-colors"
                    >
                      <span className="w-9 h-9 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {s.number}
                      </span>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-[11px] text-gray-500">{s.englishName} - {s.ayahs} آيات - {s.type}</p>
                      </div>
                    </button>
                  ))}
                  {filteredSurahs.length === 0 && (
                    <p className="text-center text-gray-500 py-8 text-sm">لا توجد نتائج</p>
                  )}
                </div>
              </div>
            )}

            {/* Hizb Tab */}
            {searchTab === "hizb" && (
              <div className="pt-3">
                <p className="text-xs text-gray-500 mb-3 text-center">اختر حزب للانتقال إليه</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(h => (
                    <button
                      key={h}
                      onClick={() => navigateTo({ type: "hizb", hizb: h })}
                      className="aspect-square rounded-xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center hover:border-gold-600/50 hover:bg-gold-600/10 active:bg-gold-600/20 transition-colors"
                    >
                      <span className="text-sm font-bold text-gold-500">{h}</span>
                      <span className="text-[9px] text-gray-600">ج {Math.ceil(h / 2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Juz Tab */}
            {searchTab === "juz" && (
              <div className="pt-3">
                <p className="text-xs text-gray-500 mb-3 text-center">اختر جزء للانتقال إليه</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                    <button
                      key={j}
                      onClick={() => navigateTo({ type: "juz", juz: j })}
                      className="aspect-square rounded-xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center hover:border-primary-500/30 hover:bg-gray-800 active:scale-95 transition-colors"
                    >
                      <span className="text-lg font-bold text-white">{j}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Page Jump Tab */}
            {searchTab === "page" && (
              <div className="pt-3">
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={pageJumpInput}
                    onChange={(e) => setPageJumpInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
                    placeholder="أدخل رقم الصفحة (1-604)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={handlePageJump}
                    disabled={!pageJumpInput || isNaN(parseInt(pageJumpInput)) || parseInt(pageJumpInput) < 1 || parseInt(pageJumpInput) > 604}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    انتقل
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3 text-center">أو اختر من الأجزاء</p>
                <div className="space-y-3">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(j => {
                    const startPage = Math.round((j - 1) * (604 / 30)) + 1;
                    const endPage = Math.round(j * (604 / 30));
                    return (
                      <div key={j}>
                        <p className="text-xs text-primary-400 font-bold mb-1.5">الجزء {j}</p>
                        <div className="grid grid-cols-10 gap-1">
                          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
                            <button
                              key={p}
                              onClick={() => navigateTo({ type: "page", page: p })}
                              className={`py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                                contentSource.type === "page" && contentSource.page === p
                                  ? "bg-primary-600 text-white"
                                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-primary-500/30"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Text Search Tab */}
            {searchTab === "search" && (
              <div className="pt-3">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTextSearch()}
                    placeholder="ابحث في القرآن الكريم..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={handleTextSearch}
                    disabled={searching || !textQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "بحث"
                    )}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">{searchResults.length} نتيجة</p>
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => navigateTo({ type: "search", query: textQuery.trim() })}
                        className="w-full text-right p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-primary-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400 font-bold">
                            {r.surah.name} : {r.ayah.numberInSurah}
                          </span>
                          <span className="text-[10px] text-gray-600">صفحة {r.ayah.page}</span>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-uthmanic), serif" }}>
                          {r.ayah.text}
                        </p>
                      </button>
                    ))}
                    <button
                      onClick={() => navigateTo({ type: "search", query: textQuery.trim() })}
                      className="w-full py-3 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 text-sm font-medium"
                    >
                      عرض الكل في وضع القراءة
                    </button>
                  </div>
                )}

                {searchResults.length === 0 && textQuery && !searching && (
                  <p className="text-center text-gray-500 py-8 text-sm">لا توجد نتائج</p>
                )}

                {!textQuery && (
                  <p className="text-center text-gray-600 py-8 text-sm">اكتب كلمة أو جملة للبحث في القرآن الكريم</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
