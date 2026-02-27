"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getJuzAyahs, Surah, Ayah } from "@/lib/quranData";
import { useSettingsStore } from "@/stores/settingsStore";

export default function JuzPage() {
  const params = useParams();
  const juzNumber = Number(params.juz);
  const [sections, setSections] = useState<{ surah: Surah; ayahs: Ayah[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    getJuzAyahs(juzNumber).then((data) => {
      setSections(data);
      setLoading(false);
    });
  }, [juzNumber]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title={`الجزء ${juzNumber}`} showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title={`الجزء ${juzNumber}`} showBack />

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
            {ayahs.map((ayah) => (
              <span key={ayah.numberInSurah} className="quran-text" style={{ fontSize: `${fontSize}px` }}>
                {ayah.text}
                <span className="ayah-marker">{ayah.numberInSurah}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
