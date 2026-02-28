"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { searchQuran, Surah, Ayah } from "@/lib/quranData";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ surah: Surah; ayah: Ayah }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await searchQuran(query.trim());
    setResults(res.slice(0, 50));
    setSearching(false);
    setSearched(true);
  }, [query]);

  return (
    <div className="max-w-lg mx-auto">
      <Header title="البحث في القرآن" showBack />
      <div className="px-4 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ابحث في القرآن الكريم..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {searching ? "..." : "بحث"}
          </button>
        </div>

        {searching && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
          </div>
        )}

        {searched && !searching && results.length === 0 && (
          <p className="text-center text-[var(--muted)] py-12">لا توجد نتائج</p>
        )}

        <div className="mt-4 space-y-3">
          {results.map((r, i) => (
            <Link key={i} href={`/quran/${r.surah.number}`}>
              <Card className="hover:border-[var(--accent)] transition-colors mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                    {r.surah.name} : {r.ayah.numberInSurah}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">صفحة {r.ayah.page}</span>
                </div>
                <p className="quran-text text-base leading-[2]">{r.ayah.text}</p>
              </Card>
            </Link>
          ))}
        </div>

        {results.length > 0 && (
          <p className="text-center text-xs text-[var(--muted)] py-4">
            {results.length} نتيجة {results.length >= 50 ? "(أول 50)" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
