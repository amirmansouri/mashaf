"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getHizbAyahs, Surah, Ayah } from "@/lib/quranData";
import { useSettingsStore } from "@/stores/settingsStore";

export default function HizbPage() {
  const params = useParams();
  const hizbNumber = Number(params.hizb);
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    getHizbAyahs(hizbNumber).then((data) => {
      setSections(data);
      setLoading(false);
    });
  }, [hizbNumber]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title={`الحزب ${hizbNumber}`} showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Detect hizb quarter boundaries for separators
  let prevHizbQuarter = 0;

  return (
    <div className="max-w-lg mx-auto">
      <Header title={`الحزب ${hizbNumber}`} showBack />

      <div className="px-4 pb-24 py-4">
        {sections.map(({ surah, ayahs }) => (
          <div key={surah.number} className="mb-8">
            {/* Surah Title */}
            <div className="text-center py-4 mb-4">
              <div className="inline-block px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <p className="font-bold">{surah.name}</p>
              </div>
            </div>

            {/* Ayahs */}
            <div className="quran-text leading-[2.5]" style={{ fontSize: `${fontSize}px` }}>
              {ayahs.map((ayah) => {
                const showSeparator = prevHizbQuarter !== 0 && ayah.hizbQuarter !== prevHizbQuarter;
                prevHizbQuarter = ayah.hizbQuarter;
                return (
                  <span key={ayah.numberInSurah}>
                    {showSeparator && (
                      <span className="block text-center py-3 my-2">
                        <span className="inline-block px-4 py-1 rounded-full bg-gold-600/10 text-gold-500 text-xs font-bold border border-gold-600/20">
                          ربع الحزب {Math.ceil(ayah.hizbQuarter / 2)} — {((ayah.hizbQuarter - 1) % 2) + 1}/2
                        </span>
                      </span>
                    )}
                    {ayah.text}
                    <span className="ayah-marker">{ayah.numberInSurah}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
