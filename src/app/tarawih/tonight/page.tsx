"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTarawihStore } from "@/stores/tarawihStore";
import { getJuzAyahs, Surah, Ayah } from "@/lib/quranData";
import { useSettingsStore } from "@/stores/settingsStore";

export default function TonightPage() {
  const { currentNight, getJuzForNight, markNightComplete } = useTarawihStore();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [readAyahs, setReadAyahs] = useState(0);
  const totalAyahs = sections.reduce((sum, s) => sum + s.ayahs.length, 0);

  const juzList = getJuzForNight(currentNight);

  useEffect(() => {
    Promise.all(juzList.map((j) => getJuzAyahs(j))).then((results) => {
      setSections(results.flat());
      setLoading(false);
    });
  }, [currentNight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollPercent = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setReadAyahs(Math.round(scrollPercent * totalAyahs));
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title={`ليلة ${currentNight}`} showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title={`ليلة ${currentNight} - الجزء ${juzList.join(" و ")}`} showBack />

      <div className="sticky top-14 z-30 bg-[var(--background)] px-4 py-2">
        <ProgressBar progress={totalAyahs ? (readAyahs / totalAyahs) * 100 : 0} showLabel />
      </div>

      <div className="px-4 pb-24 overflow-y-auto" onScroll={handleScroll}>
        {sections.map(({ surah, ayahs }) => (
          <div key={`${surah.number}-${ayahs[0]?.numberInSurah}`} className="mb-8">
            <div className="text-center py-4 mb-4">
              <div className="inline-block px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <p className="font-bold">{surah.name}</p>
              </div>
            </div>
            <div className="quran-text leading-[2.5]" style={{ fontSize: `${fontSize}px` }}>
              {ayahs.map((ayah) => (
                <span key={ayah.numberInSurah}>
                  {ayah.text}
                  <span className="ayah-marker">{ayah.numberInSurah}</span>
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="py-8">
          <Button fullWidth size="lg" onClick={() => markNightComplete(currentNight)}>
            تم إكمال ليلة {currentNight} ✓
          </Button>
        </div>
      </div>
    </div>
  );
}
