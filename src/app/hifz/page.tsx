"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useHifzStore } from "@/stores/hifzStore";
import { surahNames } from "@/lib/quranData";

export default function HifzPage() {
  const { entries, getReviewDue } = useHifzStore();
  const reviewDue = getReviewDue();

  const memorizedCount = entries.filter((e) => e.status === "memorized").length;
  const reviewingCount = entries.filter((e) => e.status === "reviewing").length;

  return (
    <div className="max-w-lg mx-auto">
      <Header title="متابعة الحفظ" showBack />
      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{memorizedCount}</p>
            <p className="text-[10px] text-[var(--muted)] mt-1">محفوظ</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-gold-400">{reviewingCount}</p>
            <p className="text-[10px] text-[var(--muted)] mt-1">مراجعة</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-400">{reviewDue.length}</p>
            <p className="text-[10px] text-[var(--muted)] mt-1">مستحق اليوم</p>
          </Card>
        </div>

        {/* Review Due */}
        {reviewDue.length > 0 && (
          <Link href="/hifz/review">
            <Card gradient="gold" className="text-center">
              <p className="font-bold">{reviewDue.length} مراجعات مستحقة</p>
              <p className="text-sm mt-1 opacity-80">اضغط لبدء المراجعة</p>
            </Card>
          </Link>
        )}

        {/* Progress Overview */}
        <Card>
          <p className="font-bold mb-3">التقدم الكلي</p>
          <ProgressBar progress={(memorizedCount / 604) * 100} showLabel />
          <p className="text-xs text-[var(--muted)] mt-2 text-center">
            {memorizedCount} من ٦٠٤ صفحة
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link href="/hifz/review">
            <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">📝</span>
                <span className="font-medium">بدء مراجعة</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Card>
          </Link>
          <Link href="/hifz/children">
            <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">👨‍👧‍👦</span>
                <span className="font-medium">متابعة حفظ الأبناء</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Card>
          </Link>
        </div>

        {/* Surah Overview */}
        <div>
          <p className="font-bold mb-3">السور</p>
          <div className="space-y-1">
            {surahNames.slice(77).map((surah) => {
              const entry = entries.find((e) => e.surah === surah.number);
              return (
                <div key={surah.number} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--card)]">
                  <div className={`w-3 h-3 rounded-full ${
                    entry?.status === "memorized" ? "bg-green-500" :
                    entry?.status === "reviewing" ? "bg-yellow-500" : "bg-[var(--card-border)]"
                  }`} />
                  <span className="text-sm flex-1">{surah.name}</span>
                  <span className="text-[10px] text-[var(--muted)]">{surah.ayahs} آية</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
