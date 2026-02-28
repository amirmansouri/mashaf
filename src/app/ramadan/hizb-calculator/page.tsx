"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getHizbStartPosition, HizbPosition } from "@/lib/quranData";
import { getRamadanDay } from "@/lib/hijriDate";

type Mode = "quick" | "advanced";

export default function HizbCalculatorPage() {
  const [mode, setMode] = useState<Mode>("quick");
  const [defaultHizb, setDefaultHizb] = useState(2);
  const [currentNight, setCurrentNight] = useState(1);
  const [nightEntries, setNightEntries] = useState<number[]>([]);
  const [result, setResult] = useState<HizbPosition | null>(null);
  const [totalRead, setTotalRead] = useState(0);
  const [calculating, setCalculating] = useState(false);

  // Auto-detect Ramadan night
  useEffect(() => {
    const day = getRamadanDay();
    if (day && day > 0) {
      setCurrentNight(day);
    }
  }, []);

  // Initialize night entries when switching to advanced or when night changes
  useEffect(() => {
    if (mode === "advanced") {
      setNightEntries((prev) => {
        const pastNights = Math.max(0, currentNight - 1);
        if (prev.length === pastNights) return prev;
        const entries = new Array(pastNights).fill(defaultHizb);
        // Preserve existing values
        for (let i = 0; i < Math.min(prev.length, pastNights); i++) {
          entries[i] = prev[i];
        }
        return entries;
      });
    }
  }, [mode, currentNight, defaultHizb]);

  const calculate = async () => {
    setCalculating(true);
    let total: number;

    if (mode === "quick") {
      total = defaultHizb * (currentNight - 1);
    } else {
      total = nightEntries.reduce((sum, h) => sum + h, 0);
    }

    setTotalRead(total);
    const pos = await getHizbStartPosition(total);
    setResult(pos);
    setCalculating(false);
  };

  const updateNightEntry = (index: number, value: number) => {
    setNightEntries((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toArabicNum = (n: number): string => {
    return n.toString();
  };

  return (
    <div className="max-w-lg mx-auto">
      <Header title="حاسبة موضع الحزب" showBack />
      <div className="px-4 py-6 space-y-6">
        {/* Mode Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("quick")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "quick" ? "bg-primary-600 text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
            }`}
          >
            حساب سريع
          </button>
          <button
            onClick={() => setMode("advanced")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "advanced" ? "bg-primary-600 text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
            }`}
          >
            تفصيلي
          </button>
        </div>

        {/* Quick Mode */}
        {mode === "quick" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">كم حزب تقرأ كل ليلة؟</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDefaultHizb(Math.max(0.5, defaultHizb - 0.5))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    value={defaultHizb}
                    onChange={(e) => setDefaultHizb(Math.max(0, parseFloat(e.target.value) || 0))}
                    step={0.5}
                    min={0.5}
                    className="w-full text-center text-2xl font-bold bg-transparent focus:outline-none"
                  />
                  <p className="text-xs text-[var(--muted)]">حزب / ليلة</p>
                </div>
                <button
                  onClick={() => setDefaultHizb(Math.min(10, defaultHizb + 0.5))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الليلة الحالية من رمضان</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentNight(Math.max(1, currentNight - 1))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    value={currentNight}
                    onChange={(e) => setCurrentNight(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={30}
                    className="w-full text-center text-2xl font-bold bg-transparent focus:outline-none"
                  />
                  <p className="text-xs text-[var(--muted)]">ليلة {toArabicNum(currentNight)} من 30</p>
                </div>
                <button
                  onClick={() => setCurrentNight(Math.min(30, currentNight + 1))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <Card className="text-center py-3">
              <p className="text-sm text-[var(--muted)]">قرأت في {toArabicNum(currentNight - 1)} ليالٍ</p>
              <p className="text-lg font-bold mt-1">{toArabicNum(defaultHizb * (currentNight - 1))} حزب</p>
            </Card>
          </div>
        )}

        {/* Advanced Mode */}
        {mode === "advanced" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الليلة الحالية من رمضان</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentNight(Math.max(1, currentNight - 1))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center text-2xl font-bold">{toArabicNum(currentNight)}</span>
                <button
                  onClick={() => setCurrentNight(Math.min(30, currentNight + 1))}
                  className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">الليالي السابقة</p>
                <p className="text-xs text-[var(--muted)]">
                  المجموع: {toArabicNum(nightEntries.reduce((s, h) => s + h, 0))} حزب
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl">
                {nightEntries.map((hizb, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[var(--card)] rounded-xl px-3 py-2 border border-[var(--card-border)]">
                    <span className="text-xs text-[var(--muted)] w-14 shrink-0">ليلة {toArabicNum(idx + 1)}</span>
                    <button
                      onClick={() => updateNightEntry(idx, Math.max(0, hizb - 0.5))}
                      className="w-7 h-7 rounded-lg bg-[var(--card-border)] text-sm font-bold shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={hizb}
                      onChange={(e) => updateNightEntry(idx, Math.max(0, parseFloat(e.target.value) || 0))}
                      step={0.5}
                      min={0}
                      className="flex-1 text-center text-sm font-bold bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => updateNightEntry(idx, Math.min(10, hizb + 0.5))}
                      className="w-7 h-7 rounded-lg bg-[var(--card-border)] text-sm font-bold shrink-0"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
              {nightEntries.length === 0 && (
                <p className="text-center text-sm text-[var(--muted)] py-4">الليلة الأولى — لا توجد ليالٍ سابقة</p>
              )}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <Button fullWidth size="lg" onClick={calculate} disabled={calculating}>
          {calculating ? "جاري الحساب..." : "احسب الموضع"}
        </Button>

        {/* Result */}
        {result && (
          <Card gradient="primary" className="text-center space-y-3">
            <p className="text-sm opacity-80">ليلة {toArabicNum(currentNight)} — تبدأ من</p>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">{result.surahName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] opacity-70">الحزب</p>
                  <p className="font-bold">{toArabicNum(result.hizb)}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] opacity-70">الجزء</p>
                  <p className="font-bold">{toArabicNum(result.juz)}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] opacity-70">الآية</p>
                  <p className="font-bold">{toArabicNum(result.ayah)}</p>
                </div>
                <div className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[10px] opacity-70">الصفحة</p>
                  <p className="font-bold">{toArabicNum(result.page)}</p>
                </div>
              </div>

              <p className="text-xs opacity-70 pt-1">
                قرأت {toArabicNum(totalRead)} حزب من أصل 60
              </p>
            </div>

            <Link href={`/quran/hizb/${result.hizb}`}>
              <button className="w-full mt-2 px-4 py-2.5 rounded-xl bg-white/20 text-white font-medium text-sm active:scale-[0.97] transition-transform">
                اذهب للقراءة
              </button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
