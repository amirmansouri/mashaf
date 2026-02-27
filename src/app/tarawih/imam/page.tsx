"use client";

import { useEffect, useState, useRef } from "react";
import { useTarawihStore } from "@/stores/tarawihStore";
import { getJuzAyahs, Surah, Ayah } from "@/lib/quranData";

export default function ImamModePage() {
  const { currentNight, getJuzForNight } = useTarawihStore();
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const juzList = getJuzForNight(currentNight);

  useEffect(() => {
    Promise.all(juzList.map((j) => getJuzAyahs(j))).then((results) => {
      setSections(results.flat());
      setLoading(false);
    });
  }, [currentNight]);

  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;
    const interval = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur z-10">
        <a href="/tarawih" className="text-sm text-primary-400">رجوع</a>
        <span className="text-sm font-bold">وضع الإمام - الجزء {juzList.join(" و ")}</span>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-3 py-1 rounded-full text-xs ${autoScroll ? "bg-primary-600" : "bg-gray-700"}`}
        >
          {autoScroll ? "إيقاف" : "تمرير تلقائي"}
        </button>
      </div>

      {/* Speed Controls */}
      {autoScroll && (
        <div className="flex items-center justify-center gap-4 py-2 bg-gray-900">
          <button onClick={() => setScrollSpeed(Math.max(0.5, scrollSpeed - 0.5))} className="w-8 h-8 rounded-full bg-gray-700 text-lg">-</button>
          <span className="text-sm">السرعة: {scrollSpeed}x</span>
          <button onClick={() => setScrollSpeed(Math.min(5, scrollSpeed + 0.5))} className="w-8 h-8 rounded-full bg-gray-700 text-lg">+</button>
        </div>
      )}

      {/* Quran Text */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-8">
        {sections.map(({ surah, ayahs }) => (
          <div key={`${surah.number}-${ayahs[0]?.numberInSurah}`} className="mb-12">
            <p className="text-center text-2xl font-bold mb-6 text-primary-400">{surah.name}</p>
            <div className="imam-text">
              {ayahs.map((ayah) => (
                <span key={ayah.numberInSurah}>
                  {ayah.text}
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-600/20 text-primary-400 text-base font-bold mx-2">
                    {ayah.numberInSurah}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
