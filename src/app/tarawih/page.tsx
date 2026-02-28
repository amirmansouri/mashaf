"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useTarawihStore, NightFilter } from "@/stores/tarawihStore";
import { surahNames, getHizbStartPosition, HizbPosition } from "@/lib/quranData";

// Map juz number to the surahs that start in it (approximate)
const juzStartSurah: Record<number, number[]> = {
  1: [1, 2], 2: [2], 3: [2, 3], 4: [3, 4], 5: [4], 6: [4, 5],
  7: [5, 6], 8: [6, 7], 9: [7, 8], 10: [8, 9], 11: [9, 10, 11],
  12: [11, 12], 13: [12, 13, 14], 14: [15, 16], 15: [17, 18],
  16: [18, 19, 20], 17: [21, 22], 18: [23, 24, 25], 19: [25, 26, 27],
  20: [27, 28, 29], 21: [29, 30, 31, 32, 33], 22: [33, 34, 35, 36],
  23: [36, 37, 38, 39], 24: [39, 40, 41], 25: [41, 42, 43, 44, 45],
  26: [46, 47, 48, 49, 50, 51], 27: [51, 52, 53, 54, 55, 56, 57],
  28: [58, 59, 60, 61, 62, 63, 64, 65, 66], 29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
};

function getSurahNamesForJuz(juzList: number[]): string {
  const surahSet = new Set<number>();
  for (const juz of juzList) {
    const surahs = juzStartSurah[juz];
    if (surahs) surahs.forEach((s) => surahSet.add(s));
  }
  const names = Array.from(surahSet)
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map((n) => surahNames[n - 1]?.name)
    .filter(Boolean);
  if (surahSet.size > 3) return names.join("، ") + "...";
  return names.join("، ");
}

const filterTabs: { key: NightFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "completed", label: "مكتمل" },
  { key: "remaining", label: "متبقي" },
  { key: "current", label: "الليلة" },
];

export default function TarawihPage() {
  const {
    plan, currentNight, createPlan, resetPlan,
    getJuzForNight, savedPositions, nightFilter, setNightFilter,
    hizbLog, setHizbLog, removeHizbLog,
  } = useTarawihStore();
  const [selectedPlan, setSelectedPlan] = useState<number>(30);

  // Hizb tracker state
  const [trackerInput, setTrackerInput] = useState("");
  const [trackerEditNight, setTrackerEditNight] = useState<number | null>(null);
  const [showBulkFill, setShowBulkFill] = useState(false);
  const [bulkHizb, setBulkHizb] = useState("");
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [trackerPosition, setTrackerPosition] = useState<HizbPosition | null>(null);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const trackerNights = Object.keys(hizbLog).map(Number).sort((a, b) => a - b);
  const trackerTotal = trackerNights.reduce((sum, n) => sum + (hizbLog[n] || 0), 0);
  const trackerNextNight = trackerNights.length > 0 ? Math.max(...trackerNights) + 1 : 1;

  const getCumulativeTotal = (night: number) => {
    let total = 0;
    for (const n of trackerNights) {
      if (n <= night) total += hizbLog[n] || 0;
    }
    return total;
  };

  const handleTrackerAdd = (night: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    setHizbLog(night, num);
    setTrackerInput("");
    setTrackerEditNight(null);
  };

  const handleBulkFill = () => {
    const hizb = parseFloat(bulkHizb);
    const from = parseInt(bulkFrom);
    const to = parseInt(bulkTo);
    if (isNaN(hizb) || isNaN(from) || isNaN(to) || hizb <= 0 || from <= 0 || to < from) return;
    for (let i = from; i <= to; i++) {
      setHizbLog(i, hizb);
    }
    setBulkHizb("");
    setBulkFrom("");
    setBulkTo("");
    setShowBulkFill(false);
  };

  const loadTrackerPosition = useCallback(async () => {
    if (trackerTotal <= 0) { setTrackerPosition(null); return; }
    setTrackerLoading(true);
    try {
      const pos = await getHizbStartPosition(trackerTotal);
      setTrackerPosition(pos);
    } finally {
      setTrackerLoading(false);
    }
  }, [trackerTotal]);

  useEffect(() => {
    loadTrackerPosition();
  }, [loadTrackerPosition]);

  const progress = plan ? Math.round((plan.completedNights.length / plan.totalNights) * 100) : 0;

  const planOptions = [
    { nights: 30, label: "30 ليلة", desc: "جزء كل ليلة" },
    { nights: 20, label: "20 ليلة", desc: "1.5 جزء كل ليلة" },
    { nights: 10, label: "10 ليالي", desc: "3 أجزاء كل ليلة" },
  ];

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="خطة التراويح" />
        <div className="px-4 py-6 space-y-6">
          <div className="text-center py-8">
            <span className="text-6xl">🌙</span>
            <h2 className="text-xl font-bold mt-4">أنشئ خطة التراويح</h2>
            <p className="text-[var(--muted)] text-sm mt-2">
              اختر عدد الليالي لإتمام ختمة القرآن الكريم
            </p>
          </div>

          <div className="space-y-3">
            {planOptions.map((opt) => (
              <Card
                key={opt.nights}
                onClick={() => setSelectedPlan(opt.nights)}
                className={`flex items-center justify-between ${
                  selectedPlan === opt.nights ? "border-[var(--accent)]" : ""
                }`}
              >
                <div>
                  <p className="font-bold">{opt.label}</p>
                  <p className="text-sm text-[var(--muted)]">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPlan === opt.nights
                    ? "bg-primary-500 border-primary-500"
                    : "border-[var(--card-border)]"
                }`} />
              </Card>
            ))}
          </div>

          <Button fullWidth size="lg" onClick={() => createPlan(selectedPlan)}>
            ابدأ الخطة
          </Button>
        </div>
      </div>
    );
  }

  const allNights = Array.from({ length: plan.totalNights }, (_, i) => i + 1);
  const filteredNights = allNights.filter((night) => {
    switch (nightFilter) {
      case "completed": return plan.completedNights.includes(night);
      case "remaining": return !plan.completedNights.includes(night);
      case "current": return night === currentNight;
      default: return true;
    }
  });

  return (
    <div className="max-w-lg mx-auto">
      <Header title="خطة التراويح" />
      <div className="px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex flex-col items-center">
          <ProgressRing progress={progress} size={140} strokeWidth={10}>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-[10px] text-[var(--muted)]">مكتمل</p>
            </div>
          </ProgressRing>
          <p className="text-sm text-[var(--muted)] mt-3">
            {plan.completedNights.length} من {plan.totalNights} ليلة
          </p>
        </div>

        {/* Tonight's Reading */}
        <Link href="/tarawih/tonight">
          <Card gradient="primary" className="text-center">
            <p className="text-sm opacity-80">قراءة الليلة {currentNight}</p>
            <p className="text-xl font-bold mt-1">
              الجزء {getJuzForNight(currentNight).join(" و ")}
            </p>
            {savedPositions[currentNight] && (
              <p className="text-sm mt-1 opacity-90">
                متابعة من {savedPositions[currentNight].surahName} - آية {savedPositions[currentNight].ayah}
              </p>
            )}
            <p className="text-sm mt-2 opacity-90">
              {savedPositions[currentNight] ? "اضغط للمتابعة" : "اضغط للبدء"}
            </p>
          </Card>
        </Link>

        {/* Imam Mode */}
        <Link href="/tarawih/imam">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <p className="font-bold">وضع الإمام</p>
                <p className="text-xs text-[var(--muted)]">نص كبير مع تمرير تلقائي</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>

        {/* Hizb Tracker */}
        <div className="space-y-3">
          <h3 className="font-bold">متابعة القراءة بالأحزاب</h3>

          {/* Current position */}
          {trackerTotal > 0 && (
            <Card className="!p-4 border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[var(--gold)]">موضعك الليلة</span>
                <span className="text-xs text-[var(--muted)]">{trackerTotal} / 60 حزب</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--card-border)] mb-3">
                <div
                  className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
                  style={{ width: `${Math.min((trackerTotal / 60) * 100, 100)}%` }}
                />
              </div>
              {trackerLoading ? (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : trackerPosition ? (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">الحزب</span>
                      <span className="font-bold text-[var(--gold)]">{trackerPosition.hizb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">الجزء</span>
                      <span className="font-bold">{trackerPosition.juz}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">السورة</span>
                      <span className="font-bold">{trackerPosition.surahName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">الآية</span>
                      <span className="font-bold">{trackerPosition.ayah}</span>
                    </div>
                  </div>
                  <Link
                    href="/tarawih/imam"
                    className="block w-full mt-2 py-2.5 rounded-xl bg-[var(--gold)] text-black text-sm font-bold text-center active:scale-95 transition-transform"
                  >
                    ابدأ القراءة من الموضع
                  </Link>
                </div>
              ) : null}
            </Card>
          )}

          {/* Add night */}
          <Card className="!p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">
                {trackerEditNight ? `تعديل ليلة ${trackerEditNight}` : `إضافة ليلة ${trackerNextNight}`}
              </span>
              <button
                onClick={() => setShowBulkFill(!showBulkFill)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--card-border)] text-[var(--muted)]"
              >
                {showBulkFill ? "إدخال فردي" : "تعبئة سريعة"}
              </button>
            </div>

            {!showBulkFill ? (
              <>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={trackerInput}
                    onChange={(e) => setTrackerInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrackerAdd(trackerEditNight || trackerNextNight, trackerInput)}
                    placeholder="عدد الأحزاب"
                    className="flex-1 px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                  <button
                    onClick={() => handleTrackerAdd(trackerEditNight || trackerNextNight, trackerInput)}
                    disabled={!trackerInput || isNaN(parseFloat(trackerInput)) || parseFloat(trackerInput) <= 0}
                    className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold disabled:opacity-40"
                  >
                    {trackerEditNight ? "تعديل" : "إضافة"}
                  </button>
                  {trackerEditNight && (
                    <button
                      onClick={() => { setTrackerEditNight(null); setTrackerInput(""); }}
                      className="px-3 py-2 rounded-xl bg-[var(--card-border)] text-[var(--muted)] text-sm"
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
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        trackerInput === v.toString()
                          ? "bg-primary-600/20 text-primary-400 border-primary-500/50"
                          : "bg-[var(--background)] text-[var(--muted)] border-[var(--card-border)]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[var(--muted)]">
                  مثال: قرأت 2.5 حزب كل ليلة من ليلة 1 إلى 4
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--muted)] mb-1 block">الأحزاب</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={bulkHizb}
                      onChange={(e) => setBulkHizb(e.target.value)}
                      placeholder="2.5"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted)] mb-1 block">من ليلة</label>
                    <input
                      type="number"
                      min="1"
                      value={bulkFrom}
                      onChange={(e) => setBulkFrom(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted)] mb-1 block">إلى ليلة</label>
                    <input
                      type="number"
                      min="1"
                      value={bulkTo}
                      onChange={(e) => setBulkTo(e.target.value)}
                      placeholder="4"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </div>
                {bulkHizb && bulkFrom && bulkTo && !isNaN(parseFloat(bulkHizb)) && (
                  <p className="text-xs text-[var(--gold)]">
                    {parseInt(bulkTo) - parseInt(bulkFrom) + 1} ليلة × {bulkHizb} حزب = {(parseInt(bulkTo) - parseInt(bulkFrom) + 1) * parseFloat(bulkHizb)} حزب
                  </p>
                )}
                <button
                  onClick={handleBulkFill}
                  disabled={!bulkHizb || !bulkFrom || !bulkTo || isNaN(parseFloat(bulkHizb)) || parseFloat(bulkHizb) <= 0}
                  className="w-full py-2.5 rounded-xl bg-[var(--gold)] text-black text-sm font-bold disabled:opacity-40"
                >
                  تعبئة
                </button>
              </div>
            )}
          </Card>

          {/* Log table */}
          {trackerNights.length > 0 && (
            <Card className="!p-0 overflow-hidden">
              <div className="grid grid-cols-4 gap-1 px-4 py-2 bg-[var(--card-border)]/50 text-[11px] text-[var(--muted)] font-medium">
                <span>الليلة</span>
                <span>الأحزاب</span>
                <span>المجموع</span>
                <span></span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {trackerNights.map(night => (
                  <div key={night} className="grid grid-cols-4 gap-1 px-4 py-2 border-t border-[var(--card-border)] items-center">
                    <span className="text-sm font-bold text-primary-400">{night}</span>
                    <span className="text-sm text-[var(--gold)]">{hizbLog[night]}</span>
                    <span className="text-sm">{getCumulativeTotal(night)}</span>
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => { setTrackerEditNight(night); setTrackerInput(hizbLog[night].toString()); setShowBulkFill(false); }}
                        className="w-7 h-7 rounded-lg bg-[var(--card-border)] flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-[var(--muted)]">
                          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeHizbLog(night)}
                        className="w-7 h-7 rounded-lg bg-[var(--card-border)] flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-red-400">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Filter Tabs */}
        <div>
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setNightFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  nightFilter === tab.key
                    ? "bg-primary-600 text-white"
                    : "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)]"
                }`}
              >
                {tab.label}
                {tab.key === "completed" && ` (${plan.completedNights.length})`}
                {tab.key === "remaining" && ` (${plan.totalNights - plan.completedNights.length})`}
              </button>
            ))}
          </div>

          {/* Nights Grid */}
          <h3 className="font-bold mb-3">الليالي</h3>
          {filteredNights.length === 0 ? (
            <p className="text-center text-[var(--muted)] text-sm py-8">لا توجد ليالٍ</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredNights.map((night) => {
                const completed = plan.completedNights.includes(night);
                const isCurrent = night === currentNight;
                const saved = savedPositions[night];
                const juzList = getJuzForNight(night);
                const surahInfo = getSurahNamesForJuz(juzList);

                return (
                  <Link key={night} href={isCurrent ? "/tarawih/tonight" : `/tarawih/tonight?night=${night}`}>
                    <Card
                      className={`flex items-center gap-3 ${
                        isCurrent ? "border-primary-500 border-2" : ""
                      }`}
                    >
                      {/* Night number badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        completed
                          ? "bg-primary-600 text-white"
                          : isCurrent
                          ? "bg-primary-600/20 text-primary-400"
                          : "bg-[var(--card-border)] text-[var(--muted)]"
                      }`}>
                        {night}
                      </div>

                      {/* Night details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">
                            ليلة {night}
                            {completed && " ✓"}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400">
                              الليلة
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          الجزء {juzList.join(" و ")} — {surahInfo}
                        </p>
                        {saved && (
                          <p className="text-xs text-primary-400 mt-0.5">
                            توقفت عند {saved.surahName} - آية {saved.ayah}
                          </p>
                        )}
                      </div>

                      {/* Action indicator */}
                      <div className="shrink-0">
                        {saved && !completed ? (
                          <span className="text-xs px-2 py-1 rounded-lg bg-primary-600/20 text-primary-400 font-medium">
                            متابعة
                          </span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset */}
        <Button variant="ghost" fullWidth onClick={resetPlan} className="text-red-400">
          إعادة تعيين الخطة
        </Button>
      </div>
    </div>
  );
}
